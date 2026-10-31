import { useState } from 'react'
import type { RefObject } from 'react'
import { Button } from '@/components/button'
import { Dialog } from '@/components/dialog'
import { Stepper } from '@/components/stepper'

const STEPS = [
  { label: 'Recipient', title: 'Who are you sending to?' },
  { label: 'Amount', title: 'How much?' },
  { label: 'Review', title: 'Check the details' },
]

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  returnFocusTo?: RefObject<HTMLElement | null>
}

export function TransferDialog({
  open,
  onClose,
  returnFocusTo,
}: TransferDialogProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  // Every way of closing ends up here, so the next opening starts at step 1.
  function handleClose() {
    setStepIndex(0)
    onClose()
  }

  // The step contents and the real footer actions (send, validation) come in
  // the next steps; this is the dialog's frame.
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="New transfer"
      returnFocusTo={returnFocusTo}
      subheader={
        <Stepper steps={STEPS.map((s) => s.label)} currentIndex={stepIndex} />
      }
      footer={
        <>
          <Button
            variant="secondary"
            onClick={isFirst ? handleClose : () => setStepIndex(stepIndex - 1)}
          >
            {isFirst ? 'Cancel' : 'Back'}
          </Button>
          {!isLast && (
            <Button onClick={() => setStepIndex(stepIndex + 1)}>Continue</Button>
          )}
        </>
      }
    >
      <h3>{step.title}</h3>
    </Dialog>
  )
}
