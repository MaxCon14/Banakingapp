import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import { formatCurrency } from '../utils/format'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#2563EB',
    colorBackground: '#0d0d15',
    colorText: '#ffffff',
    colorTextSecondary: '#9ca3af',
    colorDanger: '#ef4444',
    fontFamily: 'DM Sans, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '10px',
    colorIconTab: '#9ca3af',
    colorIconTabSelected: '#2563EB',
  },
  rules: {
    '.Input': {
      border: '1px solid #1e1e2e',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #2563EB',
      boxShadow: 'none',
    },
    '.Label': {
      color: '#9ca3af',
      fontSize: '0.78rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    '.Tab': { border: '1px solid #1e1e2e', boxShadow: 'none' },
    '.Tab:hover': { border: '1px solid #252538' },
    '.Tab--selected': { border: '1px solid #2563EB' },
  },
}

// ── Inner checkout form (needs Stripe context) ────────────────────────────
function CheckoutForm({ amount, onSuccess, onCancel }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handlePay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: 'if_required',
    })

    if (stripeErr) {
      setError(stripeErr.message || 'Payment failed.')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: '6px 4px', background: 'transparent', border: 'none' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div style={{
          background: 'var(--error-dim)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12,
          padding: '12px 16px',
          fontSize: '0.88rem',
          color: 'var(--error)',
        }}>
          {error}
        </div>
      )}

      <div className="info-row">
        <span className="info-row-label">You're depositing</span>
        <span className="info-row-value" style={{ color: 'var(--success)' }}>
          {formatCurrency(amount)}
        </span>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading || !stripe}>
        {loading ? 'Processing…' : `Pay ${formatCurrency(amount)}`}
      </button>
      <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
        Cancel
      </button>
    </form>
  )
}

// ── Main Add Money screen ─────────────────────────────────────────────────
export default function AddMoney() {
  const navigate = useNavigate()
  const { showToast, refreshAll, balance } = useApp()

  const [step, setStep]               = useState('amount') // amount | payment | success
  const [amount, setAmount]           = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [creatingIntent, setCreatingIntent] = useState(false)
  const [intentError, setIntentError] = useState('')

  const parsedAmount = parseFloat(amount) || 0

  const handleContinue = async () => {
    if (parsedAmount < 1) {
      setIntentError('Minimum deposit is £1.00')
      return
    }
    setCreatingIntent(true)
    setIntentError('')
    try {
      const res = await api.post('/deposit/create-intent', {
        amount: Math.round(parsedAmount * 100), // pence
      })
      setClientSecret(res.data.clientSecret)
      setStep('payment')
    } catch (err) {
      setIntentError(err.message)
    } finally {
      setCreatingIntent(false)
    }
  }

  const handleSuccess = useCallback(async () => {
    setStep('success')
    showToast(`£${parsedAmount.toFixed(2)} deposit initiated!`, 'success')
    await refreshAll()
  }, [parsedAmount, refreshAll, showToast])

  // ── Amount entry ────────────────────────────────────────────────────────
  if (step === 'amount') {
    return (
      <div className="screen fade-in">
        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <h1 className="screen-title">Add Money</h1>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div className="input-label" style={{ marginBottom: 10 }}>Amount</div>
          <div className="amount-input-wrap">
            <span className="amount-prefix">£</span>
            <input
              className="input amount-input"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setIntentError('') }}
              min="1"
              step="0.01"
              autoFocus
            />
          </div>
          {intentError && (
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--error)' }}>{intentError}</div>
          )}
        </div>

        {/* Quick amount buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 32 }}>
          {[10, 25, 50, 100].map((v) => (
            <button
              key={v}
              className="btn btn-ghost"
              style={{ padding: '10px 4px', fontSize: '0.88rem', borderRadius: 10 }}
              onClick={() => setAmount(String(v))}
            >
              £{v}
            </button>
          ))}
        </div>

        <div className="card card-sm" style={{ marginBottom: 24 }}>
          <div className="info-row">
            <span className="info-row-label">Current balance</span>
            <span className="info-row-value">{formatCurrency(balance ?? 0)}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">After deposit</span>
            <span className="info-row-value" style={{ color: 'var(--success)' }}>
              {formatCurrency((balance ?? 0) + parsedAmount)}
            </span>
          </div>
        </div>

        <button
          className="btn btn-primary"
          disabled={parsedAmount < 1 || creatingIntent}
          onClick={handleContinue}
        >
          {creatingIntent ? 'Preparing payment…' : 'Continue to payment'}
        </button>
      </div>
    )
  }

  // ── Stripe payment ──────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="screen fade-in">
        <div className="screen-header">
          <button className="back-btn" onClick={() => setStep('amount')}>←</button>
          <h1 className="screen-title">Card Payment</h1>
        </div>

        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
        >
          <CheckoutForm
            amount={parsedAmount}
            onSuccess={handleSuccess}
            onCancel={() => setStep('amount')}
          />
        </Elements>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────
  return (
    <div className="screen fade-in">
      <div className="success-wrap">
        <div className="success-icon">✓</div>
        <h2 className="success-title">Deposit received!</h2>
        <p className="success-desc">
          {formatCurrency(parsedAmount)} has been added to your Vault.<br />
          Your balance will update once the payment is confirmed.
        </p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16, maxWidth: 280 }}
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
