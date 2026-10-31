import { useId, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { transactionSearchQuery } from '@/api/queries'
import type { Transaction } from '@/api/types'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { InlineError } from '@/components/inline-error'
import { SearchInput } from '@/components/search-input'
import { TransactionItem } from '@/features/dashboard/transaction-item'
import { DASHBOARD_TRANSACTION_LIMIT } from '@/features/dashboard/use-dashboard'
import { useDebouncedValue } from '@/lib/use-debounced-value'
import styles from './index.module.css'

const SEARCH_DELAY_MS = 300

/** `shown` rows out of `total` matches. The list is capped, so when more
 * matched than are shown the count says so (`8+`) instead of claiming a
 * number that doesn't match the rows. */
function resultsLabel(total: number, shown: number): string {
  if (total > shown) return `${shown}+ results`
  return `${total} ${total === 1 ? 'result' : 'results'}`
}

/** Whether results found for `resultsTerm` can stand in while `typed` loads.
 * They can when `typed` extends them (`g` then `gr`): everything matching the
 * longer text also matches the shorter, so the rows are a superset, and an
 * empty result stays empty. Results for a longer or different text can't: they
 * could be missing rows, or claim "no matches" for something that has some. */
function isUsableWhileLoading(resultsTerm: string, typed: string): boolean {
  return typed.toLowerCase().startsWith(resultsTerm.toLowerCase())
}

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const headingId = useId()
  // Only the search text is state. Searching asks the API (`q`) for the latest
  // matches, so older transactions can be found too; the panel still lists at
  // most as many rows as the recent list. The request waits until typing
  // pauses, and while the next results load the previous ones stay up
  // (dimmed) if they can stand in for them (see `isUsableWhileLoading`);
  // otherwise the recent list shows, dimmed, until they arrive.
  const [query, setQuery] = useState('')
  const searching = query.trim() !== ''
  const term = useDebouncedValue(query.trim(), SEARCH_DELAY_MS)
  const search = useQuery({
    ...transactionSearchQuery(DASHBOARD_TRANSACTION_LIMIT, term),
    enabled: term !== '',
    placeholderData: keepPreviousData,
  })
  // Until the first results arrive the recent list stays as it is.
  const text = query.trim()
  const results =
    searching && search.data && isUsableWhileLoading(search.data.term, text)
      ? search.data
      : undefined
  const matches = results?.transactions ?? transactions
  const total = results?.total ?? 0
  // Typing hasn't paused yet, or the request is on its way: what's listed is
  // about to change.
  const isPending = searching && (term !== text || search.isFetching)

  function renderBody() {
    if (searching && search.isError) {
      return (
        <InlineError
          message="We couldn't search your transactions."
          onRetry={() => void search.refetch()}
        />
      )
    }
    if (transactions.length === 0 && !searching) {
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
            hint={results ? resultsLabel(total, results.transactions.length) : ''}
            value={query}
            onChange={setQuery}
          />
        </div>
      </div>
      {/* Keeps the height of the unfiltered list, so a search with fewer
          results doesn't make the page below it jump. */}
      <div
        className={`${styles.body} ${isPending ? styles.pending : ''}`}
        aria-busy={isPending}
        style={{ minHeight: `calc(${transactions.length} * var(--row-height))` }}
      >
        {renderBody()}
      </div>
    </section>
  )
}
