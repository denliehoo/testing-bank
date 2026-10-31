import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { accountsQuery, customerQuery } from '@/api/queries'
import type { Account } from '@/api/types'
import { isDepositAccount, remainingDailyLimit } from '@/lib/balances'
import { createTransferSchema } from '@/features/transfer/schema'
import type { TransferFormValues } from '@/features/transfer/schema'

function emptyValues(accounts: Account[]): TransferFormValues {
  return {
    payeeId: '',
    name: '',
    accountNumber: '',
    bank: '',
    fromAccountId: accounts.find(isDepositAccount)?.id ?? '',
    amount: '',
    note: '',
  }
}

/** The transfer form: the single schema, built from the cached accounts and
 * customer, wired to React Hook Form. */
export function useTransferForm() {
  const accounts = useQuery(accountsQuery).data ?? []
  const customer = useQuery(customerQuery).data

  const schema = createTransferSchema({
    accounts,
    remainingLimit: customer ? remainingDailyLimit(customer) : 0,
  })
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(schema),
    // Check a field when the user leaves it, then keep checking as they fix it.
    mode: 'onTouched',
    defaultValues: emptyValues(accounts),
  })

  return { form, resetForm: () => form.reset(emptyValues(accounts)) }
}
