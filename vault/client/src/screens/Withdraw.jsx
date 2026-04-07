import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../utils/api'
import { formatCurrency, formatUnixDate } from '../utils/format'

export default function Withdraw() {
  const navigate = useNavigate()
  const { balance, currency, showToast, refreshAll } = useApp()

  const [step, setStep]         = useState('amount') // amount | confirm | success
  const [amount, setAmount]     = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)

  const parsedAmount  = parseFloat(amount) || 0
  const availableBalance = balance ?? 0

  const handleConfirm = async () => {
    if (parsedAmount < 1) { setError('Minimum withdrawal is £1.00'); return }
    if (parsedAmount > availableBalance) { setError('Insufficient balance.'); return }
    setStep('confirm')
    setError('')
  }

  const handleWithdraw = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/withdraw', { amount: parsedAmount })
      setResult(res.data)
      setStep('success')
      showToast(`£${parsedAmount.toFixed(2)} withdrawal initiated`, 'success')
      await refreshAll()
    } catch (err) {
      setError(err.message)
      setStep('amount')
    } finally {
      setLoading(false)
    }
  }

  // ── Amount entry ────────────────────────────────────────────────────────
  if (step === 'amount') {
    return (
      <div className="screen fade-in">
        <div className="screen-header">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <h1 className="screen-title">Withdraw</h1>
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
              onChange={(e) => { setAmount(e.target.value); setError('') }}
              min="1"
              max={availableBalance}
              step="0.01"
              autoFocus
            />
          </div>
          {error && (
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--error)' }}>{error}</div>
          )}
        </div>

        {/* Quick amount buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 32 }}>
          {[10, 25, 50, 100].map((v) => (
            <button
              key={v}
              className="btn btn-ghost"
              style={{ padding: '10px 4px', fontSize: '0.88rem', borderRadius: 10 }}
              onClick={() => setAmount(String(Math.min(v, availableBalance)))}
              disabled={availableBalance < v}
            >
              £{v}
            </button>
          ))}
        </div>

        <button
          className="btn btn-ghost"
          style={{ marginBottom: 8, borderColor: 'var(--accent)', color: 'var(--accent)' }}
          onClick={() => setAmount(availableBalance.toFixed(2))}
          disabled={availableBalance <= 0}
        >
          Withdraw all — {formatCurrency(availableBalance, currency)}
        </button>

        <div className="card card-sm" style={{ marginBottom: 24 }}>
          <div className="info-row">
            <span className="info-row-label">Available balance</span>
            <span className="info-row-value">{formatCurrency(availableBalance, currency)}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">After withdrawal</span>
            <span className="info-row-value">
              {formatCurrency(Math.max(0, availableBalance - parsedAmount), currency)}
            </span>
          </div>
        </div>

        <div
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid rgba(37,99,235,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: '0.82rem',
            color: 'var(--text-sec)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Funds will be sent to your bank account linked in Stripe.
          Typical arrival: 1–2 business days.
        </div>

        <button
          className="btn btn-primary"
          disabled={parsedAmount < 1 || parsedAmount > availableBalance}
          onClick={handleConfirm}
        >
          Continue
        </button>
      </div>
    )
  }

  // ── Confirm ─────────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="screen fade-in">
        <div className="screen-header">
          <button className="back-btn" onClick={() => setStep('amount')}>←</button>
          <h1 className="screen-title">Confirm</h1>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="info-row">
            <span className="info-row-label">Withdrawal amount</span>
            <span className="info-row-value" style={{ color: 'var(--error)', fontSize: '1.1rem' }}>
              -{formatCurrency(parsedAmount, currency)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Destination</span>
            <span className="info-row-value">Your bank account</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Balance after</span>
            <span className="info-row-value">
              {formatCurrency(availableBalance - parsedAmount, currency)}
            </span>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--error-dim)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: '0.88rem',
            color: 'var(--error)',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleWithdraw}
          disabled={loading}
        >
          {loading ? 'Processing…' : `Withdraw ${formatCurrency(parsedAmount, currency)}`}
        </button>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 10 }}
          onClick={() => setStep('amount')}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────
  return (
    <div className="screen fade-in">
      <div className="success-wrap">
        <div className="success-icon" style={{ background: 'var(--success-dim)', borderColor: 'var(--success)' }}>
          ↑
        </div>
        <h2 className="success-title">Withdrawal sent!</h2>
        <p className="success-desc">
          {formatCurrency(parsedAmount, currency)} is on its way to your bank.
          {result?.arrival_date && (
            <><br />Expected arrival: {formatUnixDate(result.arrival_date)}</>
          )}
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
