import { useState } from 'react'
import { useApp } from '../context/AppContext'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatCurrency } from '../utils/format'

const EMOJI_OPTIONS = ['💰','🏖','🚗','🏠','💻','✈️','🎓','💍','🎯','🌱','🐶','🎮']

// ── Pot card ──────────────────────────────────────────────────────────────
function PotCard({ pot, currency, onManage }) {
  const pct = pot.target_amount > 0
    ? Math.min((pot.current_amount / pot.target_amount) * 100, 100)
    : 0

  return (
    <div className="pot-card" onClick={() => onManage(pot)}>
      <span className="pot-emoji">{pot.emoji}</span>
      <div className="pot-name">{pot.name}</div>
      <div className="pot-amounts">
        <span className="pot-current">{formatCurrency(pot.current_amount, currency)}</span>
        {' '}/ {formatCurrency(pot.target_amount, currency)}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="pot-pct">{Math.round(pct)}% of goal</div>
    </div>
  )
}

// ── Create pot modal ──────────────────────────────────────────────────────
function CreatePotModal({ onClose, onCreated }) {
  const [name, setName]       = useState('')
  const [target, setTarget]   = useState('')
  const [emoji, setEmoji]     = useState('💰')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleCreate = async () => {
    if (!name.trim())       { setError('Name is required.'); return }
    if (!target || parseFloat(target) <= 0) { setError('Enter a valid goal amount.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/pots', {
        name: name.trim(),
        target_amount: parseFloat(target),
        emoji,
      })
      onCreated(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">New Savings Pot</div>

        <div className="input-group">
          <label className="input-label">Name</label>
          <input
            className="input"
            placeholder="e.g. Holiday fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            autoFocus
          />
        </div>

        <div className="input-group">
          <label className="input-label">Goal amount</label>
          <div className="amount-input-wrap">
            <span className="amount-prefix" style={{ fontSize: '1rem', color: 'var(--text-sec)' }}>£</span>
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              min="1"
              step="0.01"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Emoji</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: 42, height: 42, borderRadius: 10, fontSize: '1.3rem',
                  cursor: 'pointer', border: '2px solid',
                  borderColor: emoji === e ? 'var(--accent)' : 'var(--border)',
                  background: emoji === e ? 'var(--accent-dim)' : 'var(--bg-input)',
                  transition: 'all 0.15s',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ fontSize: '0.85rem', color: 'var(--error)', marginBottom: 12 }}>{error}</div>
        )}

        <button className="btn btn-primary" onClick={handleCreate} disabled={loading} style={{ marginBottom: 10 }}>
          {loading ? 'Creating…' : 'Create pot'}
        </button>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
      </div>
    </div>
  )
}

// ── Manage pot modal ──────────────────────────────────────────────────────
function ManagePotModal({ pot, currency, mainBalance, onClose, onUpdate, onDelete }) {
  const [action, setAction]   = useState('add') // add | withdraw
  const [amount, setAmount]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const parsedAmount = parseFloat(amount) || 0

  const handleMove = async () => {
    if (parsedAmount <= 0) { setError('Enter a valid amount.'); return }
    if (action === 'add' && parsedAmount > mainBalance) { setError('Insufficient main balance.'); return }
    if (action === 'withdraw' && parsedAmount > pot.current_amount) { setError('Insufficient pot balance.'); return }

    setLoading(true)
    setError('')
    try {
      const res = await api.patch(`/pots/${pot.id}`, { action, amount: parsedAmount })
      onUpdate(res.data.pot, res.data.balance)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${pot.name}"? Any funds will be returned to your balance.`)) return
    setLoading(true)
    try {
      const res = await api.delete(`/pots/${pot.id}`)
      onDelete(pot.id, res.data.balance)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const pct = pot.target_amount > 0
    ? Math.min((pot.current_amount / pot.target_amount) * 100, 100)
    : 0

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 6 }}>{pot.emoji}</div>
          <div className="modal-title" style={{ marginBottom: 4 }}>{pot.name}</div>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.4rem' }}>
            {formatCurrency(pot.current_amount, currency)}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-sec)', marginTop: 4 }}>
            goal: {formatCurrency(pot.target_amount, currency)} · {Math.round(pct)}%
          </div>
          <div className="progress-bar" style={{ marginTop: 10 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['add', 'withdraw'].map((a) => (
            <button
              key={a}
              className={`btn ${action === a ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, padding: '10px 8px', fontSize: '0.88rem' }}
              onClick={() => { setAction(a); setAmount(''); setError('') }}
            >
              {a === 'add' ? '+ Add funds' : '↑ Withdraw'}
            </button>
          ))}
        </div>

        <div className="amount-input-wrap" style={{ marginBottom: 12 }}>
          <span className="amount-prefix" style={{ fontSize: '1rem', color: 'var(--text-sec)' }}>£</span>
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError('') }}
            min="0.01"
            step="0.01"
          />
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-sec)', marginBottom: 16 }}>
          {action === 'add'
            ? `Available: ${formatCurrency(mainBalance, currency)}`
            : `In pot: ${formatCurrency(pot.current_amount, currency)}`}
        </div>

        {error && (
          <div style={{ fontSize: '0.85rem', color: 'var(--error)', marginBottom: 12 }}>{error}</div>
        )}

        <button className="btn btn-primary" onClick={handleMove} disabled={loading || parsedAmount <= 0} style={{ marginBottom: 10 }}>
          {loading ? 'Moving…' : action === 'add' ? 'Add to pot' : 'Withdraw from pot'}
        </button>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading} style={{ marginBottom: 10 }}>
          Close
        </button>
        <button className="btn btn-danger" onClick={handleDelete} disabled={loading} style={{ fontSize: '0.85rem', padding: '10px' }}>
          Delete pot
        </button>
      </div>
    </div>
  )
}

// ── Main Pots screen ──────────────────────────────────────────────────────
export default function Pots() {
  const { pots, setPots, balance, setBalance, currency, loading, showToast } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [managePot, setManagePot]   = useState(null)

  const handleCreated = (pot) => {
    setPots((prev) => [...prev, pot])
    setShowCreate(false)
    showToast(`"${pot.name}" pot created!`, 'success')
  }

  const handleUpdate = (updatedPot, newBalance) => {
    setPots((prev) => prev.map((p) => (p.id === updatedPot.id ? updatedPot : p)))
    setBalance(newBalance)
    setManagePot(updatedPot)
    showToast('Pot updated.', 'success')
  }

  const handleDelete = (potId, newBalance) => {
    setPots((prev) => prev.filter((p) => p.id !== potId))
    setBalance(newBalance)
    setManagePot(null)
    showToast('Pot deleted. Funds returned.', 'success')
  }

  if (loading) return <LoadingSpinner />

  const totalInPots = pots.reduce((s, p) => s + p.current_amount, 0)

  return (
    <div className="screen fade-in">
      <div className="screen-header">
        <h1 className="screen-title">Pots</h1>
      </div>

      {pots.length > 0 && (
        <div className="card card-sm" style={{ marginBottom: 20 }}>
          <div className="info-row">
            <span className="info-row-label">Total in pots</span>
            <span className="info-row-value">{formatCurrency(totalInPots, currency)}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Available balance</span>
            <span className="info-row-value">{formatCurrency((balance ?? 0) - totalInPots, currency)}</span>
          </div>
        </div>
      )}

      <div className="pots-grid">
        {pots.map((pot) => (
          <PotCard
            key={pot.id}
            pot={pot}
            currency={currency}
            onManage={setManagePot}
          />
        ))}
        <div className="add-pot-card" onClick={() => setShowCreate(true)}>
          <span style={{ fontSize: '1.6rem' }}>+</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>New pot</span>
        </div>
      </div>

      {showCreate && (
        <CreatePotModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {managePot && (
        <ManagePotModal
          pot={managePot}
          currency={currency}
          mainBalance={(balance ?? 0) - totalInPots + managePot.current_amount}
          onClose={() => setManagePot(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
