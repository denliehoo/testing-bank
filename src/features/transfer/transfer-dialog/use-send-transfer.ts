import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { queryKeys } from '@/api/query-keys'
import { sendTransfer } from '@/api/transfers'

/**
 * `POST /api/transfers`. A transfer changes the balance, adds a transaction
 * and uses up some of the daily limit, so all three queries are invalidated.
 * Invalidating (instead of patching the cache from the response) means the
 * dashboard can't drift from the server. Returning the promise keeps the
 * mutation pending until they've refetched, so "Transfer sent" only appears
 * once the dashboard behind it is already up to date.
 */
export function useSendTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendTransfer,
    onSuccess: () =>
      Promise.all(
        [queryKeys.customer, queryKeys.accounts, queryKeys.transactions].map(
          (queryKey) => queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  })
}

const SEND_ERROR =
  "Something went wrong. Your money hasn't left your account. Try again."

/** If the API rejected the request with a reason (400/422), say it. Anything
 * else (server down, `#fail`) gets the standard copy. */
export function sendErrorMessage(error: Error): string {
  return error instanceof ApiError && error.fields ? error.message : SEND_ERROR
}
