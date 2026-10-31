import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from './client'
import { queryKeys } from './query-keys'
import type {
  AccountsResponse,
  CustomerResponse,
  TransactionsResponse,
} from './types'

// Each query unwraps its response envelope, so the cache holds `Customer`,
// `Account[]` and `Transaction[]` directly.

export const customerQuery = queryOptions({
  queryKey: queryKeys.customer,
  queryFn: async () =>
    (await apiFetch<CustomerResponse>('/api/customer')).customer,
})

export const accountsQuery = queryOptions({
  queryKey: queryKeys.accounts,
  queryFn: async () =>
    (await apiFetch<AccountsResponse>('/api/accounts')).accounts,
})

export function transactionsQuery(limit: number) {
  return queryOptions({
    queryKey: [...queryKeys.transactions, { limit }],
    queryFn: async () =>
      (await apiFetch<TransactionsResponse>(`/api/transactions?limit=${limit}`))
        .transactions,
  })
}
