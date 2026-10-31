import type { Payee, TransferRecipient } from '@/api/types'
import { NEW_RECIPIENT } from './schema'
import type { TransferFormValues } from './schema'

/** Who the money goes to, in the shape the review and success screens show.
 * A saved payee already has a masked number; a new recipient's is built from
 * what was typed. */
export function resolveRecipient(
  values: TransferFormValues,
  payees: Payee[],
): TransferRecipient | undefined {
  if (values.payeeId === NEW_RECIPIENT) {
    return {
      name: values.name.trim(),
      bank: values.bank,
      accountNumberMasked: `•••• ${values.accountNumber.slice(-4)}`,
    }
  }
  const payee = payees.find((p) => p.id === values.payeeId)
  return (
    payee && {
      name: payee.name,
      bank: payee.bank,
      accountNumberMasked: payee.accountNumberMasked,
    }
  )
}
