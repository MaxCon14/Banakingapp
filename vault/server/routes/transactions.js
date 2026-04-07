const express = require('express')
const db = require('../db')

const router = express.Router()

// GET /api/transactions
router.get('/transactions', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const offset = parseInt(req.query.offset) || 0

    const { rows } = await db.query(
      `SELECT id, type, amount, stripe_payment_intent_id, stripe_payout_id,
              status, created_at
       FROM   transactions
       ORDER  BY created_at DESC
       LIMIT  $1 OFFSET $2`,
      [limit, offset]
    )

    const countResult = await db.query('SELECT COUNT(*) FROM transactions')
    const total = parseInt(countResult.rows[0].count)

    res.json({
      transactions: rows.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
      })),
      total,
      limit,
      offset,
    })
  } catch (err) {
    console.error('GET /transactions error:', err)
    res.status(500).json({ error: 'Failed to fetch transactions.' })
  }
})

module.exports = router
