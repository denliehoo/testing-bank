import { useState } from 'react'
import type { TransferFormValues } from '@/features/transfer/schema'
import { STEPS } from './steps'
import { toTransferRequest } from './transfer-request'
import { sendErrorMessage, useSendTransfer } from './use-send-transfer'
import { useTransferForm } from './use-transfer-form'

/** The transfer wizard: which step it is on, the form, and the send. */
export function useTransferFlow() {
  const [stepIndex, setStepIndex] = useState(0)
  const { form, resetForm } = useTransferForm()
  const sendMutation = useSendTransfer()
  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1
  const isSending = sendMutation.isPending
  const sent = sendMutation.data?.transfer

  // The send error belongs to the attempt that made it, so moving to another
  // step clears it.
  function goToStep(index: number) {
    sendMutation.reset()
    setStepIndex(index)
  }

  async function goNext() {
    const valid = await form.trigger(step.fields, { shouldFocus: true })
    if (valid) goToStep(stepIndex + 1)
  }

  function send(values: TransferFormValues) {
    // The button is disabled while sending; this covers Enter as well.
    if (isSending) return
    sendMutation.mutate(toTransferRequest(values))
  }

  return {
    form,
    stepIndex,
    step,
    isFirst: stepIndex === 0,
    isLast,
    isSending,
    sent,
    sendError: sendMutation.error && sendErrorMessage(sendMutation.error),
    hasChanges: form.formState.isDirty && !sent,
    goBack: () => goToStep(stepIndex - 1),
    // Enter on any step, and the Continue / Confirm button.
    submitStep: () => (isLast ? void form.handleSubmit(send)() : void goNext()),
    startAnother() {
      resetForm()
      goToStep(0)
    },
  }
}
