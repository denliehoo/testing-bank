import { useQuery } from '@tanstack/react-query'
import { useFormContext, useWatch } from 'react-hook-form'
import { accountsQuery, customerQuery } from '@/api/queries'
import { Button } from '@/components/button'
import { Field } from '@/components/field'
import { isDepositAccount, remainingDailyLimit } from '@/lib/balances'
import { formatMoney } from '@/lib/format'
import { NOTE_MAX_LENGTH } from '@/features/transfer/schema'
import type { TransferFormValues } from '@/features/transfer/schema'
import styles from './index.module.css'

const QUICK_AMOUNTS = [50, 100, 250, 500]

export function AmountStep() {
  const { register, control, setValue, trigger, getValues, formState } =
    useFormContext<TransferFormValues>()
  const { errors } = formState
  const accounts = useQuery(accountsQuery).data ?? []
  const customer = useQuery(customerQuery).data
  const [fromAccountId, amount, note] = useWatch({
    control,
    name: ['fromAccountId', 'amount', 'note'],
  })

  const fromAccounts = accounts.filter(isDepositAccount)
  const account = accounts.find((a) => a.id === fromAccountId)

  return (
    <div className={styles.step}>
      <Field
        label="From account"
        hint="Deposit accounts only"
        error={errors.fromAccountId?.message}
      >
        {(props) => (
          <select
            {...props}
            {...register('fromAccountId', {
              // The amount's balance rule depends on this account, so check it
              // again, but not before the user has typed something.
              onChange: () => {
                if (getValues('amount')) void trigger('amount')
              },
            })}
          >
            {fromAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.maskedNumber}
              </option>
            ))}
          </select>
        )}
      </Field>

      <div className={styles.amount}>
        <Field label="Amount (SGD)" error={errors.amount?.message}>
          {(props) => (
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              {...props}
              {...register('amount')}
            />
          )}
        </Field>
        <div className={styles.chips} role="group" aria-label="Quick amounts">
          {QUICK_AMOUNTS.map((value) => (
            <Button
              key={value}
              variant="secondary"
              aria-pressed={amount === String(value)}
              onClick={() =>
                setValue('amount', String(value), {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
            >
              {value}
            </Button>
          ))}
        </div>
        <p className={styles.info}>
          {account && <>Available {formatMoney(account.balance)}</>}
        </p>
        <p className={styles.info}>
          {customer && (
            <>Remaining daily limit {formatMoney(remainingDailyLimit(customer))}</>
          )}
        </p>
      </div>

      <Field
        label="Note (optional)"
        aside={`${note.length}/${NOTE_MAX_LENGTH}`}
        error={errors.note?.message}
      >
        {(props) => (
          <input type="text" autoComplete="off" {...props} {...register('note')} />
        )}
      </Field>
    </div>
  )
}
