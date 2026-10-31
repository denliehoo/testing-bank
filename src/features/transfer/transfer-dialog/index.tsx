import { useId, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { accountsQuery, customerQuery } from '@/api/queries'
import { ApiError } from '@/api/client'
import type { Account } from '@/api/types'
import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { InlineError } from '@/components/inline-error'
import { Stepper } from '@/components/stepper'
import { isDepositAccount, remainingDailyLimit } from '@/lib/balances'
import { AmountStep } from '../amount-step'
import { RecipientStep } from '../recipient-step'
import { ReviewStep } from '../review-step'
import { createTransferSchema } from '../schema'
import type { TransferFormValues } from '../schema'
import { SuccessPanel } from '../success-panel'
import { toTransferRequest } from '../transfer-request'
import { useSendTransfer } from '../use-send-transfer'
import styles from './index.module.css'

const SEND_ERROR =
  "Something went wrong. Your money hasn't left your account. Try again."

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

function submitLabel(isLast: boolean, isSending: boolean): string {
  if (!isLast) return 'Continue'
  return isSending ? 'Sending…' : 'Confirm transfer'
}

/** If the API rejected the request with a reason (400/422), say it. Anything
 * else (server down, `#fail`) gets the standard copy. */
function sendErrorMessage(error: Error): string {
  return error instanceof ApiError && error.fields ? error.message : SEND_ERROR
}

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
  // Closing through the dialog (rather than unmounting it) is what hands focus
  // back to the button that opened it.
  const [isOpen, setOpen] = useState(true)
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
    defaultValues: emptyValues(accounts),
  })

  const sendMutation = useSendTransfer()
  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1
  const isSending = sendMutation.isPending
  const sent = sendMutation.data?.transfer

  // The send error belongs to the attempt that made it, so moving to another
  // step clears it.
  function goToStep(index: number) {
    sendMutation.reset()
    setStepIndex(index)
  }

  function startAnother() {
    form.reset(emptyValues(accounts))
    goToStep(0)
  }

  async function handleContinue() {
    const valid = await form.trigger(step.fields, { shouldFocus: true })
    if (valid) goToStep(stepIndex + 1)
  }

  function send(values: TransferFormValues) {
    // The button is disabled while sending; this covers Enter as well.
    if (isSending) return
    sendMutation.mutate(toTransferRequest(values))
  }

  const sendError = sendMutation.error && sendErrorMessage(sendMutation.error)

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="New transfer"
      returnFocusTo={returnFocusTo}
      closeDisabled={isSending}
      subheader={
        sent ? undefined : (
          <Stepper steps={STEPS.map((s) => s.label)} currentIndex={stepIndex} />
        )
      }
      footer={
        sent ? undefined : (
          <>
            <Button
              variant="secondary"
              disabled={isSending}
              onClick={isFirst ? () => setOpen(false) : () => goToStep(stepIndex - 1)}
            >
              {isFirst ? 'Cancel' : 'Back'}
            </Button>
            <Button type="submit" form={formId} disabled={isSending}>
              {submitLabel(isLast, isSending)}
            </Button>
          </>
        )
      }
    >
      {/* Not one ternary with the form: this region has to stay in the page,
          empty, so that what later appears in it is announced. */}
      <div aria-live="polite">
        {sent && (
          <SuccessPanel
            transfer={sent}
            onDone={() => setOpen(false)}
            onAnother={startAnother}
          />
        )}
      </div>
      {!sent && (
        <FormProvider {...form}>
          <form
            id={formId}
            noValidate
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault()
              if (isLast) void form.handleSubmit(send)()
              else void handleContinue()
            }}
          >
            <h3 className={styles.title}>{step.title}</h3>
            {sendError && <InlineError message={sendError} />}
            <step.Content />
          </form>
        </FormProvider>
      )}
    </Dialog>
  )
}
