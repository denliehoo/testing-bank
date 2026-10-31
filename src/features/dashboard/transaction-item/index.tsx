import type { Transaction } from '@/api/types'
import { formatMoney, formatShortDate } from '@/lib/format'
import styles from './index.module.css'

// The API amount is always positive; direction says which way the money went.
function signedAmount(transaction: Transaction) {
  return transaction.direction === 'in'
    ? `+${formatMoney(transaction.amount)}`
    : formatMoney(-transaction.amount)
}

export function TransactionItem({
  transaction,
}: {
  transaction: Transaction
}) {
  return (
    <li className={styles.row}>
      <div className={styles.details}>
        <span className={styles.description} title={transaction.description}>
          {transaction.description}
        </span>
        <span className={styles.meta}>
          <span className={styles.category}>{transaction.category}</span>
          {' · '}
          {formatShortDate(transaction.date)}
        </span>
      </div>
      <div className={styles.side}>
        {transaction.status === 'pending' && (
          <span className={styles.pending}>Pending</span>
        )}
        <span
          className={`${styles.amount} ${
            transaction.direction === 'in' ? styles.moneyIn : ''
          }`}
        >
          {signedAmount(transaction)}
        </span>
      </div>
    </li>
  )
}
