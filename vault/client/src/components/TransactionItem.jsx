import { formatCurrency, formatDateShort } from '../utils/format'

export default function TransactionItem({ tx }) {
  const isDeposit = tx.type === 'deposit'

  return (
    <div className="tx-item">
      <div className={`tx-icon ${tx.type}`}>
        {isDeposit ? '↓' : '↑'}
      </div>

      <div className="tx-info">
        <div className="tx-type">{isDeposit ? 'Deposit' : 'Withdrawal'}</div>
        <div className="tx-date">{formatDateShort(tx.created_at)}</div>
      </div>

      <div className="tx-right">
        <div className={`tx-amount ${tx.type}`}>
          {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
        </div>
        <div className={`tx-status ${tx.status}`}>{tx.status}</div>
      </div>
    </div>
  )
}
