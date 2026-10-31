import { useId, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { accountsQuery, customerQuery } from '@/api/queries'
import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { Stepper } from '@/components/stepper'
import { isDepositAccount, remainingDailyLimit } from '@/lib/balances'
import { AmountStep } from '../amount-step'
import { RecipientStep } from '../recipient-step'
import { ReviewStep } from '../review-step'
import { createTransferSchema } from '../schema'
import type { TransferFormValues } from '../schema'
import styles from './index.module.css'

// `fields` are the form fields each step owns: Continue validates just those.
const STEPS: {
  label: string
  title: string
  fields: (keyof TransferFormValues)[]
  Content: () => ReactNode
}[] = [
  {
    label: 'Recipient',
    title: 'Who are you sending to?',
    fields: ['payeeId', 'name', 'accountNumber', 'bank'],
    Content: RecipientStep,
  },
  {
    label: 'Amount',
    title: 'How much?',
    fields: ['fromAccountId', 'amount', 'note'],
    Content: AmountStep,
  },
  {
    label: 'Review',
    title: 'Check the details',
    fields: [],
    Content: ReviewStep,
  },
]

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  returnFocusTo?: RefObject<HTMLElement | null>
}

/** Mounted only while open, so every opening starts with a fresh form. */
export function TransferDialog({ open, ...rest }: TransferDialogProps) {
  return open ? <TransferFlow {...rest} /> : null
}

function TransferFlow({
  onClose,
  returnFocusTo,
}: Omit<TransferDialogProps, 'open'>) {
  const formId = useId()
  const [stepIndex, setStepIndex] = useState(0)
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
    defaultValues: {
      payeeId: '',
      name: '',
      accountNumber: '',
      bank: '',
      fromAccountId: accounts.find(isDepositAccount)?.id ?? '',
      amount: '',
      note: '',
    },
  })

  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  async function handleContinue() {
    const valid = await form.trigger(step.fields, { shouldFocus: true })
    if (valid && !isLast) setStepIndex(stepIndex + 1)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="New transfer"
      returnFocusTo={returnFocusTo}
      subheader={
        <Stepper steps={STEPS.map((s) => s.label)} currentIndex={stepIndex} />
      }
      footer={
        <>
          <Button
            variant="secondary"
            onClick={isFirst ? onClose : () => setStepIndex(stepIndex - 1)}
          >
            {isFirst ? 'Cancel' : 'Back'}
          </Button>
          {!isLast && (
            <Button type="submit" form={formId}>
              Continue
            </Button>
          )}
        </>
      }
    >
      <FormProvider {...form}>
        <form
          id={formId}
          noValidate
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            void handleContinue()
          }}
        >
          <h3 className={styles.title}>{step.title}</h3>
          <step.Content />
        </form>
      </FormProvider>
    </Dialog>
  )
}
