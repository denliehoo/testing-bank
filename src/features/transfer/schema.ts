import { z } from 'zod'
import type { Account } from '@/api/types'
import { formatMoney } from '@/lib/format'

/** The "Send to someone new" choice shares the payee radio group, so it needs
 * a value that can't clash with a payee id. */
export const NEW_RECIPIENT = 'new'
export const NOTE_MAX_LENGTH = 50

// All inputs are strings, as that's what the form holds. `amount` is parsed
// with `parseAmount` once it has passed validation.
const fields = z.object({
  payeeId: z.string(),
  name: z.string(),
  accountNumber: z.string(),
  bank: z.string(),
  fromAccountId: z.string(),
  amount: z.string(),
  note: z.string(),
})

export type TransferFormValues = z.infer<typeof fields>

interface SchemaContext {
  accounts: Account[]
  remainingLimit: number
}

export function parseAmount(value: string): number {
  return Number(value.trim())
}

/** The message for the first rule the amount breaks, if any. */
function amountError(
  text: string,
  account: Account | undefined,
  remainingLimit: number,
): string | undefined {
  const decimals = text.split('.')[1]?.length ?? 0
  const amount = parseAmount(text)

  if (!text) return 'Enter an amount.'
  if (!/^\d+(\.\d+)?$/.test(text)) return 'Enter a valid amount, like 120.00.'
  if (decimals > 2) return 'Use at most 2 decimal places.'
  if (amount < 1) return `Amount must be at least ${formatMoney(1)}.`
  if (account && amount > account.balance) {
    return `Amount can't be more than your available balance (${formatMoney(account.balance)}).`
  }
  if (amount > remainingLimit) {
    return `This transfer exceeds your remaining daily limit (${formatMoney(remainingLimit)}).`
  }
}

/**
 * Every rule and message of the transfer form (brief §3.3), in one place. It
 * runs for inline errors (per field) and for Continue/submit. It's a factory
 * because two rules depend on live data: the chosen account's balance and the
 * remaining daily limit. One `superRefine` over the whole object, not a rule
 * per field, because those rules read more than one field.
 */
export function createTransferSchema({ accounts, remainingLimit }: SchemaContext) {
  return fields.superRefine((values, ctx) => {
    const fail = (path: keyof TransferFormValues, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    // Recipient: a saved payee needs no more than being chosen.
    if (!values.payeeId) {
      fail('payeeId', "Choose who you're sending to.")
    } else if (values.payeeId === NEW_RECIPIENT) {
      const name = values.name.trim()
      if (name.length < 2 || name.length > 50) {
        fail('name', 'Enter a name between 2 and 50 characters.')
      }
      if (!/^\d{8}$/.test(values.accountNumber)) {
        fail('accountNumber', 'Enter a valid 8-digit account number.')
      }
      if (!values.bank.trim()) fail('bank', 'Choose a bank.')
    }

    const account = accounts.find((a) => a.id === values.fromAccountId)
    if (!account) fail('fromAccountId', 'Choose an account to send from.')

    const amountMessage = amountError(
      values.amount.trim(),
      account,
      remainingLimit,
    )
    if (amountMessage) fail('amount', amountMessage)

    if (values.note.length > NOTE_MAX_LENGTH) {
      fail('note', `Keep the note to ${NOTE_MAX_LENGTH} characters or fewer.`)
    }
  })
}
