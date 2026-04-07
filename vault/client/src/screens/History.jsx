import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import TransactionItem from '../components/TransactionItem'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'

export default function History() {
  const { transactions: ctxTx, loading } = useApp()
  const [all, setAll]       = useState([])
  const [fetching, setFetching] = useState(false)
  const [total, setTotal]   = useState(0)
  const [offset, setOffset] = useState(0)
  const LIMIT = 50

  useEffect(() => {
    const load = async () => {
      setFetching(true)
      try {
        const res = await api.get(`/transactions?limit=${LIMIT}&offset=0`)
        setAll(res.data.transactions)
        setTotal(res.data.total)
        setOffset(LIMIT)
      } catch {
        setAll(ctxTx)
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [])

  const loadMore = async () => {
    setFetching(true)
    try {
      const res = await api.get(`/transactions?limit=${LIMIT}&offset=${offset}`)
      setAll((prev) => [...prev, ...res.data.transactions])
      setOffset((prev) => prev + LIMIT)
    } finally {
      setFetching(false)
    }
  }

  const deposits    = all.filter((t) => t.type === 'deposit' && t.status === 'completed')
  const withdrawals = all.filter((t) => t.type === 'withdrawal' && t.status === 'completed')
  const totalIn     = deposits.reduce((s, t) => s + t.amount, 0)
  const totalOut    = withdrawals.reduce((s, t) => s + t.amount, 0)

  if (loading && all.length === 0) return <LoadingSpinner />

  return (
    <div className="screen fade-in">
      <div className="screen-header">
        <h1 className="screen-title">History</h1>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <div className="card card-sm">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sec)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total In</div>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.1rem', color: 'var(--success)' }}>
            +£{totalIn.toFixed(2)}
          </div>
        </div>
        <div className="card card-sm">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-sec)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Total Out</div>
          <div style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: '1.1rem', color: 'var(--error)' }}>
            -£{totalOut.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card" style={{ padding: '4px 16px' }}>
        {all.length === 0 && !fetching ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>
            <div className="empty-icon">↕</div>
            <div className="empty-text">No transactions yet.</div>
          </div>
        ) : (
          <div className="tx-list">
            {all.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Load more */}
      {all.length < total && (
        <button
          className="btn btn-ghost"
          style={{ marginTop: 16 }}
          onClick={loadMore}
          disabled={fetching}
        >
          {fetching ? 'Loading…' : `Load more (${total - all.length} remaining)`}
        </button>
      )}
    </div>
  )
}
