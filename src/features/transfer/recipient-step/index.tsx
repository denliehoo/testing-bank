import { useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFormContext, useWatch } from 'react-hook-form'
import { payeesQuery } from '@/api/queries'
import { EmptyState } from '@/components/empty-state'
import { Field } from '@/components/field'
import { InlineError } from '@/components/inline-error'
import { SearchInput } from '@/components/search-input'
import { Skeleton } from '@/components/skeleton'
import { VisuallyHidden } from '@/components/visually-hidden'
import { NEW_RECIPIENT } from '@/features/transfer/schema'
import type { TransferFormValues } from '@/features/transfer/schema'
import styles from './index.module.css'

// There's no banks endpoint and the brief only asks for "Bank (select)", so
// the list is ours: the banks the saved payees use plus a few more. The API
// accepts any 2–30 characters. Alphabetical, so it's easy to scan.
const BANKS = ['Citibank', 'DBS', 'HSBC', 'Maybank', 'OCBC', 'POSB', 'UOB']

export function RecipientStep() {
  const { register, control, formState } = useFormContext<TransferFormValues>()
  const { errors } = formState
  const selected = useWatch({ control, name: 'payeeId' })
  const payees = useQuery(payeesQuery)
  const [search, setSearch] = useState('')
  const errorId = useId()

  // The API returns every payee at once (no paging) and the list is small, so
  // all of them are rendered and filtered here.
  const term = search.trim().toLowerCase()
  const visible = (payees.data ?? []).filter((payee) =>
    payee.name.toLowerCase().includes(term),
  )

  return (
    <div className={styles.step}>
      <SearchInput
        label="Search payees"
        placeholder="Search payees"
        value={search}
        onChange={setSearch}
      />

      {payees.isError && (
        <InlineError
          message="We couldn't load your payees. You can still send to someone new."
          onRetry={() => void payees.refetch()}
        />
      )}

      <fieldset
        className={styles.group}
        aria-describedby={errors.payeeId ? errorId : undefined}
      >
        <legend>
          <VisuallyHidden>Recipient</VisuallyHidden>
        </legend>

        {payees.isPending && <Skeleton height="4.5rem" />}
        {payees.data?.length === 0 && (
          <EmptyState message="You don't have any saved payees yet." />
        )}
        {payees.data && payees.data.length > 0 && visible.length === 0 && (
          <EmptyState message={`No payees match "${search.trim()}".`} />
        )}

        {visible.map((payee) => (
          <label key={payee.id} className={styles.option}>
            <input type="radio" value={payee.id} {...register('payeeId')} />
            <span className={styles.avatar} aria-hidden="true">
              {payee.initials}
            </span>
            <span className={styles.text}>
              <span className={styles.name}>{payee.name}</span>
              <span className={styles.detail}>
                {payee.bank} · {payee.accountNumberMasked}
              </span>
            </span>
          </label>
        ))}

        <label className={styles.option}>
          <input type="radio" value={NEW_RECIPIENT} {...register('payeeId')} />
          <span className={styles.text}>
            <span className={styles.name}>Send to someone new</span>
          </span>
        </label>

        {errors.payeeId && (
          <p id={errorId} className={styles.error}>
            {errors.payeeId.message}
          </p>
        )}
      </fieldset>

      {selected === NEW_RECIPIENT && (
        <div className={styles.newRecipient}>
          <Field label="Recipient name" error={errors.name?.message}>
            {(props) => (
              <input type="text" autoComplete="off" {...props} {...register('name')} />
            )}
          </Field>
          <Field
            label="Account number"
            hint="8 digits"
            error={errors.accountNumber?.message}
          >
            {(props) => (
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                {...props}
                {...register('accountNumber')}
              />
            )}
          </Field>
          <Field label="Bank" error={errors.bank?.message}>
            {(props) => (
              <select {...props} {...register('bank')}>
                <option value="">Choose a bank</option>
                {BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      )}
    </div>
  )
}
