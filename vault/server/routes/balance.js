const express = require('express')
const db = require('../db')

const router = express.Router()

// GET /api/balance
router.get('/balance', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, balance, currency, created_at FROM accounts WHERE id = 1 LIMIT 1'
    )
    if (!rows.length) {
      return res.status(404).json({ error: 'Account not found. Run the seed script.' })
    }
    res.json({ balance: parseFloat(rows[0].balance), currency: rows[0].currency })
  } catch (err) {
    console.error('GET /balance error:', err)
    res.status(500).json({ error: 'Failed to fetch balance.' })
  }
})

module.exports = router
