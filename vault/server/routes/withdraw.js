const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const db = require('../db')

const router = express.Router()

// POST /api/withdraw
// Body: { amount: number } — amount in pounds (£)
router.post('/withdraw', async (req, res) => {
  const { amount } = req.body

  if (!amount || isNaN(amount) || amount < 1) {
    return res.status(400).json({ error: 'amount must be at least £1.' })
  }

  const amountPounds = parseFloat(amount)
  const amountPence = Math.round(amountPounds * 100)

  const client = await db.pool.connect()
  try {
    await client.query('BEGIN')

    // Check balance
    const accountResult = await client.query(
      'SELECT balance FROM accounts WHERE id = 1 FOR UPDATE'
    )
    const balance = parseFloat(accountResult.rows[0].balance)

    if (balance < amountPounds) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Insufficient balance.' })
    }

    // Debit balance immediately (hold funds during payout)
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = 1',
      [amountPounds]
    )

    // Create Stripe Payout to your default bank account
    let payout
    try {
      payout = await stripe.payouts.create({
        amount: amountPence,
        currency: 'gbp',
        statement_descriptor: 'VAULT WITHDRAWAL',
      })
    } catch (stripeErr) {
      // Rollback balance deduction if Stripe fails
      await client.query('ROLLBACK')
      console.error('Stripe payout error:', stripeErr)
      return res.status(500).json({
        error: stripeErr.message || 'Failed to create payout. Check Stripe balance and bank account.',
      })
    }

    // Record completed transaction
    await client.query(
      `INSERT INTO transactions (type, amount, stripe_payout_id, status)
       VALUES ('withdrawal', $1, $2, 'completed')`,
      [amountPounds, payout.id]
    )

    await client.query('COMMIT')

    res.json({
      message: `Withdrawal of £${amountPounds.toFixed(2)} initiated.`,
      payout_id: payout.id,
      arrival_date: payout.arrival_date,
      new_balance: balance - amountPounds,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('POST /withdraw error:', err)
    res.status(500).json({ error: 'Withdrawal failed.' })
  } finally {
    client.release()
  }
})

module.exports = router
