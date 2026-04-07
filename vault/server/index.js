require('dotenv').config()
const express = require('express')
const cors = require('cors')

const depositRoutes     = require('./routes/deposit')
const withdrawRoutes    = require('./routes/withdraw')
const balanceRoutes     = require('./routes/balance')
const transactionRoutes = require('./routes/transactions')
const potsRoutes        = require('./routes/pots')

const app = express()

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Stripe webhook MUST receive raw body — mount before express.json()
app.use('/api/deposit/confirm', depositRoutes)

// Standard JSON middleware for all other routes
app.use(express.json())

// Routes
app.use('/api/deposit', depositRoutes)
app.use('/api', withdrawRoutes)
app.use('/api', balanceRoutes)
app.use('/api', transactionRoutes)
app.use('/api/pots', potsRoutes)

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }))

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error.' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Vault API running on http://localhost:${PORT}`)
})
