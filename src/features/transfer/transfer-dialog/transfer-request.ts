import type { CreateTransferRequest } from '@/api/types'
import { NEW_RECIPIENT, parseAmount } from '@/features/transfer/schema'
import type { TransferFormValues } from '@/features/transfer/schema'

/** Turns validated form values into the API's request: a saved payee is sent
 * by id, someone new by their details, never both. */
export function toTransferRequest(
  values: TransferFormValues,
): CreateTransferRequest {
  const note = values.note.trim()

  return {
    fromAccountId: values.fromAccountId,
    amount: parseAmount(values.amount),
    ...(note && { note }),
    ...(values.payeeId === NEW_RECIPIENT
      ? {
          recipient: {
            name: values.name.trim(),
            accountNumber: values.accountNumber,
            bank: values.bank,
          },
        }
      : { payeeId: values.payeeId }),
  }
}
