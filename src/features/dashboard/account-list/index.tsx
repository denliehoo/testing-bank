import type { Account } from '@/api/types'
import { EmptyState } from '@/components/empty-state'
import { formatMoney } from '@/lib/format'
import styles from './index.module.css'

export function AccountList({ accounts }: { accounts: Account[] }) {
  return (
    <section aria-labelledby="accounts-heading" className={styles.section}>
      <h2 id="accounts-heading" className={styles.heading}>
        Accounts
      </h2>
      {accounts.length === 0 ? (
        <EmptyState message="No accounts to show." />
      ) : (
        <ul className={styles.grid}>
          {accounts.map((account) => (
            <li key={account.id} className={styles.card}>
              <span className={styles.name}>{account.name}</span>
              <span className={styles.number}>{account.maskedNumber}</span>
              <span className={styles.balance}>
                {formatMoney(account.balance)}
              </span>
              {account.type === 'credit' && (
                <span className={styles.due}>Amount due</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
