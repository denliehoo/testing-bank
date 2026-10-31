import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { accountsQuery, payeesQuery } from '@/api/queries'
import { formatMoney } from '@/lib/format'
import { resolveRecipient } from './resolve-recipient'
import { parseAmount } from '@/features/transfer/schema'
import type { TransferFormValues } from '@/features/transfer/schema'
import styles from './index.module.css'

const FEE = 0

export function ReviewStep() {
  const { getValues } = useFormContext<TransferFormValues>()
  const accounts = useQuery(accountsQuery).data ?? []
  const payees = useQuery(payeesQuery).data ?? []

  // Not reactive on purpose: the inputs are on earlier steps, so nothing here
  // changes while this one is showing.
  const values = getValues()
  const account = accounts.find((a) => a.id === values.fromAccountId)
  const recipient = resolveRecipient(values, payees)
  const amount = parseAmount(values.amount)

  return (
    <div className={styles.step}>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>From</dt>
          <dd>
            {account?.name} · {account?.maskedNumber}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>To</dt>
          <dd>
            {recipient?.name} · {recipient?.bank} ·{' '}
            {recipient?.accountNumberMasked}
          </dd>
        </div>
        <div className={styles.row}>
          <dt>Amount</dt>
          <dd>{formatMoney(amount)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Fee</dt>
          <dd>{formatMoney(FEE)}</dd>
        </div>
        {values.note && (
          <div className={styles.row}>
            <dt>Note</dt>
            <dd>{values.note}</dd>
          </div>
        )}
        <div className={`${styles.row} ${styles.total}`}>
          <dt>Total</dt>
          <dd>{formatMoney(amount + FEE)}</dd>
        </div>
      </dl>
      <p className={styles.eta}>Usually arrives in minutes.</p>
    </div>
  )
}
