import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import TransactionItem from '../components/TransactionItem'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency } from '../utils/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const { balance, currency, transactions, pots, loading } = useApp()

  const totalInPots = pots.reduce((s, p) => s + p.current_amount, 0)
  const availableBalance = (balance ?? 0) - totalInPots

  if (loading) return <LoadingSpinner />

  return (
    <div className="screen fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 4 }}>
        <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          ⬡ Vault
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-sec)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px' }}>
          {currency}
        </span>
      </div>

      {/* Balance hero */}
      <div className="balance-hero">
        <div className="balance-label">Total Balance</div>
        <div className="balance-amount">{formatCurrency(balance ?? 0, currency)}</div>
        {totalInPots > 0 && (
          <div className="balance-currency">
            {formatCurrency(availableBalance, currency)} available · {formatCurrency(totalInPots, currency)} in pots
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button className="quick-btn" onClick={() => navigate('/add')}>
          <div className="quick-btn-icon blue">
            <span style={{ fontSize: '1.5rem' }}>+</span>
          </div>
          <span className="quick-btn-label">Add Money</span>
        </button>
        <button className="quick-btn" onClick={() => navigate('/withdraw')}>
          <div className="quick-btn-icon green">
            <span style={{ fontSize: '1.5rem' }}>↑</span>
          </div>
          <span className="quick-btn-label">Withdraw</span>
        </button>
      </div>

      {/* Pots summary */}
      {pots.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-header">
            <span className="section-title">Savings Pots</span>
            <Link to="/pots" className="section-link">View all</Link>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {pots.slice(0, 4).map((pot) => {
              const pct = pot.target_amount > 0
                ? Math.min((pot.current_amount / pot.target_amount) * 100, 100)
                : 0
              return (
                <Link
                  to="/pots"
                  key={pot.id}
                  style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}
                >
                  <div
                    className="card card-sm"
                    style={{ width: 140, cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{pot.emoji}</div>
                    <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '0.82rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pot.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sec)', marginBottom: 8 }}>
                      {formatCurrency(pot.current_amount, currency)}
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <div className="section-header">
          <span className="section-title">Recent Activity</span>
          <Link to="/history" className="section-link">See all</Link>
        </div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {transactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">◎</div>
              <div className="empty-text">No transactions yet.<br />Add money to get started.</div>
            </div>
          ) : (
            <div className="tx-list">
              {transactions.slice(0, 5).map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
