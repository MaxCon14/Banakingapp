const express = require('express')
const db = require('../db')

const router = express.Router()

// GET /api/pots
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM pots ORDER BY created_at ASC'
    )
    res.json(
      rows.map((p) => ({
        ...p,
        target_amount: parseFloat(p.target_amount),
        current_amount: parseFloat(p.current_amount),
      }))
    )
  } catch (err) {
    console.error('GET /pots error:', err)
    res.status(500).json({ error: 'Failed to fetch pots.' })
  }
})

// POST /api/pots
router.post('/', async (req, res) => {
  const { name, target_amount, emoji } = req.body

  if (!name || !target_amount) {
    return res.status(400).json({ error: 'name and target_amount are required.' })
  }
  if (isNaN(target_amount) || target_amount <= 0) {
    return res.status(400).json({ error: 'target_amount must be a positive number.' })
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO pots (name, target_amount, emoji)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), parseFloat(target_amount), emoji || '💰']
    )
    const pot = rows[0]
    res.status(201).json({
      ...pot,
      target_amount: parseFloat(pot.target_amount),
      current_amount: parseFloat(pot.current_amount),
    })
  } catch (err) {
    console.error('POST /pots error:', err)
    res.status(500).json({ error: 'Failed to create pot.' })
  }
})

// PATCH /api/pots/:id — move funds into or out of pot
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { action, amount } = req.body // action: 'add' | 'withdraw'

  if (!['add', 'withdraw'].includes(action)) {
    return res.status(400).json({ error: 'action must be "add" or "withdraw".' })
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' })
  }

  const client = await db.pool.connect()
  try {
    await client.query('BEGIN')

    const potResult = await client.query(
      'SELECT * FROM pots WHERE id = $1 FOR UPDATE',
      [id]
    )
    if (!potResult.rows.length) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Pot not found.' })
    }

    const accountResult = await client.query(
      'SELECT balance FROM accounts WHERE id = 1 FOR UPDATE'
    )
    const accountBalance = parseFloat(accountResult.rows[0].balance)
    const pot = potResult.rows[0]
    const moveAmount = parseFloat(amount)

    if (action === 'add') {
      if (accountBalance < moveAmount) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'Insufficient balance.' })
      }
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = 1',
        [moveAmount]
      )
      await client.query(
        'UPDATE pots SET current_amount = current_amount + $1 WHERE id = $2',
        [moveAmount, id]
      )
    } else {
      const potBalance = parseFloat(pot.current_amount)
      if (potBalance < moveAmount) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: 'Insufficient pot balance.' })
      }
      await client.query(
        'UPDATE pots SET current_amount = current_amount - $1 WHERE id = $2',
        [moveAmount, id]
      )
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = 1',
        [moveAmount]
      )
    }

    await client.query('COMMIT')

    const updatedPot = await db.query('SELECT * FROM pots WHERE id = $1', [id])
    const updatedAccount = await db.query(
      'SELECT balance FROM accounts WHERE id = 1'
    )

    res.json({
      pot: {
        ...updatedPot.rows[0],
        target_amount: parseFloat(updatedPot.rows[0].target_amount),
        current_amount: parseFloat(updatedPot.rows[0].current_amount),
      },
      balance: parseFloat(updatedAccount.rows[0].balance),
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('PATCH /pots/:id error:', err)
    res.status(500).json({ error: 'Failed to update pot.' })
  } finally {
    client.release()
  }
})

// DELETE /api/pots/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const client = await db.pool.connect()
  try {
    await client.query('BEGIN')

    const potResult = await client.query(
      'SELECT * FROM pots WHERE id = $1 FOR UPDATE',
      [id]
    )
    if (!potResult.rows.length) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Pot not found.' })
    }

    const pot = potResult.rows[0]
    const returnAmount = parseFloat(pot.current_amount)

    if (returnAmount > 0) {
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = 1',
        [returnAmount]
      )
    }

    await client.query('DELETE FROM pots WHERE id = $1', [id])
    await client.query('COMMIT')

    const updatedAccount = await db.query(
      'SELECT balance FROM accounts WHERE id = 1'
    )
    res.json({
      message: 'Pot deleted. Funds returned to main balance.',
      balance: parseFloat(updatedAccount.rows[0].balance),
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('DELETE /pots/:id error:', err)
    res.status(500).json({ error: 'Failed to delete pot.' })
  } finally {
    client.release()
  }
})

module.exports = router
