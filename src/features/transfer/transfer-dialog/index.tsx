import { useId, useState } from 'react'
import type { RefObject } from 'react'
import { FormProvider } from 'react-hook-form'
import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { InlineError } from '@/components/inline-error'
import { Stepper } from '@/components/stepper'
import { STEPS } from './steps'
import { SuccessPanel } from '@/features/transfer/success-panel'
import { toTransferRequest } from './transfer-request'
import { sendErrorMessage, useSendTransfer } from './use-send-transfer'
import { useTransferForm } from './use-transfer-form'
import type { TransferFormValues } from '@/features/transfer/schema'
import styles from './index.module.css'

function submitLabel(isLast: boolean, isSending: boolean): string {
  if (!isLast) return 'Continue'
  return isSending ? 'Sending…' : 'Confirm transfer'
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
  // Asking whether to throw away what's been typed (see `requestClose`).
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const { form, resetForm } = useTransferForm()
  const sendMutation = useSendTransfer()
  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1
  const isSending = sendMutation.isPending
  const sent = sendMutation.data?.transfer
  const { isDirty } = form.formState

  // The send error belongs to the attempt that made it, so moving to another
  // step clears it.
  function goToStep(index: number) {
    sendMutation.reset()
    setStepIndex(index)
  }

  // Every way of closing (Cancel, ✕, Esc) comes here. A form with changes asks
  // first; asking again (✕ or Esc on the question) means keep editing.
  function requestClose() {
    if (confirmingDiscard) setConfirmingDiscard(false)
    else if (isDirty && !sent) setConfirmingDiscard(true)
    else setOpen(false)
  }

  function startAnother() {
    resetForm()
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

  function renderFooter() {
    if (confirmingDiscard) {
      return (
        <>
          <Button variant="secondary" autoFocus onClick={() => setConfirmingDiscard(false)}>
            Keep editing
          </Button>
          <Button onClick={() => setOpen(false)}>Discard</Button>
        </>
      )
    }
    if (sent) return undefined
    return (
      <>
        <Button
          variant="secondary"
          disabled={isSending}
          onClick={isFirst ? requestClose : () => goToStep(stepIndex - 1)}
        >
          {isFirst ? 'Cancel' : 'Back'}
        </Button>
        <Button type="submit" form={formId} disabled={isSending}>
          {submitLabel(isLast, isSending)}
        </Button>
      </>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="New transfer"
      returnFocusTo={returnFocusTo}
      closeDisabled={isSending}
      onCloseRequest={requestClose}
      subheader={
        sent || confirmingDiscard ? undefined : (
          <Stepper steps={STEPS.map((s) => s.label)} currentIndex={stepIndex} />
        )
      }
      footer={renderFooter()}
    >
      {/* Not one ternary with the form: this region has to stay in the page,
          empty, so that what later appears in it is announced. */}
      <div
        aria-live="polite"
        className={confirmingDiscard ? styles.confirm : undefined}
      >
        {confirmingDiscard && (
          <h3 className={styles.confirmTitle}>Discard this transfer?</h3>
        )}
        {sent && (
          <SuccessPanel
            transfer={sent}
            onDone={() => setOpen(false)}
            onAnother={startAnother}
          />
        )}
      </div>
      {!sent && !confirmingDiscard && (
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
