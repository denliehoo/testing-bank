import { useQuery } from '@tanstack/react-query'
import { accountsQuery, customerQuery, transactionsQuery } from '@/api/queries'
import {
  isDepositAccount,
  remainingDailyLimit,
  totalAvailable,
} from '@/lib/balances'

export const DASHBOARD_TRANSACTION_LIMIT = 8

/**
 * The dashboard's three requests. They're independent `useQuery` calls made in
 * the same render, so they run in parallel. Totals are derived on every render
 * from the cached data, never stored.
 *
 * `data` is only defined when all three succeeded. If any of them failed
 * (including a refetch after a transfer) the whole dashboard reports an error
 * rather than showing balances that might be stale.
 */
export function useDashboard() {
  const customer = useQuery(customerQuery)
  const accounts = useQuery(accountsQuery)
  const transactions = useQuery(transactionsQuery(DASHBOARD_TRANSACTION_LIMIT))

  const queries = [customer, accounts, transactions]
  // While Retry is refetching, the query is no longer in error, so the page
  // goes back to its loading state instead of sitting on a stale error.
  const isError = queries.some((query) => query.isError && !query.isFetching)

  function retry() {
    for (const query of queries) {
      if (query.isError) void query.refetch()
    }
  }

  const data =
    !isError && customer.data && accounts.data && transactions.data
      ? {
          customer: customer.data,
          accounts: accounts.data,
          transactions: transactions.data,
          totalAvailable: totalAvailable(accounts.data),
          depositAccountCount: accounts.data.filter(isDepositAccount).length,
          remainingDailyLimit: remainingDailyLimit(customer.data),
        }
      : undefined

  // `customer` is exposed on its own because the page needs it earlier than
  // the rest (to know the default segment before showing anything coloured).
  return { data, customer: customer.data, isError, retry }
}

export type DashboardData = NonNullable<ReturnType<typeof useDashboard>['data']>
