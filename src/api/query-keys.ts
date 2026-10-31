// Shared by the query definitions and by whatever invalidates them (e.g. the
// transfer mutation). The transactions key is a prefix: invalidating it also
// covers every `[..., { limit }]` variant.
export const queryKeys = {
  customer: ['customer'],
  accounts: ['accounts'],
  transactions: ['transactions'],
} as const
