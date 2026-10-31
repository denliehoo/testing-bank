import type { RefObject } from 'react'
import { Button } from '@/components/button'

function submitLabel(isLast: boolean, isSending: boolean): string {
  if (!isLast) return 'Continue'
  return isSending ? 'Sending…' : 'Confirm transfer'
}

interface StepFooterProps {
  /** The form the submit button belongs to. */
  formId: string
  isFirst: boolean
  isLast: boolean
  isSending: boolean
  /** For putting focus back on it. */
  submitRef: RefObject<HTMLButtonElement | null>
  onBack: () => void
  onCancel: () => void
}

/** Back (Cancel on the first step) and Continue / Confirm transfer. */
export function StepFooter({
  formId,
  isFirst,
  isLast,
  isSending,
  submitRef,
  onBack,
  onCancel,
}: StepFooterProps) {
  return (
    <>
      <Button
        variant="secondary"
        disabled={isSending}
        onClick={isFirst ? onCancel : onBack}
      >
        {isFirst ? 'Cancel' : 'Back'}
      </Button>
      <Button
        ref={submitRef}
        type="submit"
        form={formId}
        disabled={isSending}
      >
        {submitLabel(isLast, isSending)}
      </Button>
    </>
  )
}

interface DiscardFooterProps {
  onKeepEditing: () => void
  onDiscard: () => void
}

/** The answers to `Discard this transfer?`. */
export function DiscardFooter({ onKeepEditing, onDiscard }: DiscardFooterProps) {
  return (
    <>
      {/* The safe answer has focus, so Enter can't throw the transfer away. */}
      <Button variant="secondary" autoFocus onClick={onKeepEditing}>
        Keep editing
      </Button>
      <Button onClick={onDiscard}>Discard</Button>
    </>
  )
}
