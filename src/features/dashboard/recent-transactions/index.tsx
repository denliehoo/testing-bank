import { useId, useState } from 'react'
import type { Transaction } from '@/api/types'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { SearchInput } from '@/components/search-input'
import { TransactionItem } from '@/features/dashboard/transaction-item'
import styles from './index.module.css'

function matchesSearch(transaction: Transaction, needle: string) {
  return (
    transaction.description.toLowerCase().includes(needle) ||
    transaction.category.toLowerCase().includes(needle)
  )
}

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const headingId = useId()
  // Only the search text is state. The filtered list and the count are derived.
  // The search covers the transactions listed here (the most recent ones).
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const matches = needle
    ? transactions.filter((transaction) => matchesSearch(transaction, needle))
    : transactions

  function renderBody() {
    if (transactions.length === 0) {
      return (
        <div className={styles.centered}>
          <EmptyState message="No transactions yet." />
        </div>
      )
    }
    if (matches.length === 0) {
      return (
        <div className={styles.centered}>
          <EmptyState
            message="No transactions match your search."
            action={
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            }
          />
        </div>
      )
    }
    return (
      <ul className={styles.list}>
        {matches.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <div className={styles.header}>
        <h2 id={headingId} className={styles.heading}>
          Recent transactions
        </h2>
        <div className={styles.search}>
          <SearchInput
            label="Search transactions"
            placeholder="Search transactions"
            hint={
              needle
                ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'}`
                : ''
            }
            value={query}
            onChange={setQuery}
          />
        </div>
      </div>
      {/* Keeps the height of the unfiltered list, so a search with fewer
          results doesn't make the page below it jump. */}
      <div
        className={styles.body}
        style={{ minHeight: `calc(${transactions.length} * var(--row-height))` }}
      >
        {renderBody()}
      </div>
    </section>
  )
}
