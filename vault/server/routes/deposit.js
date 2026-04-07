const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const db = require('../db')

const router = express.Router()

// POST /api/deposit/create-intent
// Body: { amount: number } — amount in pence (GBP minor units)
router.post('/create-intent', async (req, res) => {
  const { amount } = req.body

  if (!amount || isNaN(amount) || amount < 100) {
    return res.status(400).json({ error: 'amount must be at least 100 (£1.00 in pence).' })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'gbp',
      payment_method_types: ['card'],
      metadata: { vault: 'deposit' },
    })

    // Record pending transaction
    await db.query(
      `INSERT INTO transactions (type, amount, stripe_payment_intent_id, status)
       VALUES ('deposit', $1, $2, 'pending')`,
      [amount / 100, paymentIntent.id]
    )

    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id })
  } catch (err) {
    console.error('POST /deposit/create-intent error:', err)
    res.status(500).json({ error: err.message || 'Failed to create payment intent.' })
  }
})

// POST /api/deposit/confirm — Stripe webhook
// Stripe sends raw body; must be mounted BEFORE express.json()
router.post('/confirm', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const client = await db.pool.connect()
    try {
      await client.query('BEGIN')

      // Update transaction status
      await client.query(
        `UPDATE transactions
         SET    status = 'completed'
         WHERE  stripe_payment_intent_id = $1`,
        [pi.id]
      )

      // Credit the account balance (pi.amount is in pence)
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = 1',
        [pi.amount / 100]
      )

      await client.query('COMMIT')
      console.log(`Deposit confirmed: ${pi.id} — £${pi.amount / 100}`)
    } catch (dbErr) {
      await client.query('ROLLBACK')
      console.error('Webhook DB error:', dbErr)
      return res.status(500).send('DB error')
    } finally {
      client.release()
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    await db.query(
      `UPDATE transactions SET status = 'failed' WHERE stripe_payment_intent_id = $1`,
      [pi.id]
    )
  }

  res.json({ received: true })
})

module.exports = router
