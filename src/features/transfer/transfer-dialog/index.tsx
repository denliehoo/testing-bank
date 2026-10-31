import { useId, useRef } from 'react'
import type { RefObject } from 'react'
import { Dialog } from '@/components/dialog'
import { Stepper } from '@/components/stepper'
import { SuccessPanel } from '@/features/transfer/success-panel'
import { STEPS } from './steps'
import { TransferForm } from './transfer-form'
import { DiscardFooter, StepFooter } from './transfer-footer'
import { useCloseGuard } from './use-close-guard'
import { useTransferFlow } from './use-transfer-flow'
import styles from './index.module.css'

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
  const flow = useTransferFlow()
  const submitRef = useRef<HTMLButtonElement>(null)
  const guard = useCloseGuard(flow.hasChanges, submitRef)
  const { sent } = flow

  function renderFooter() {
    if (guard.confirmingDiscard) {
      return (
        <DiscardFooter onKeepEditing={guard.keepEditing} onDiscard={guard.close} />
      )
    }
    if (sent) return undefined
    return (
      <StepFooter
        formId={formId}
        isFirst={flow.isFirst}
        isLast={flow.isLast}
        isSending={flow.isSending}
        submitRef={submitRef}
        onBack={flow.goBack}
        onCancel={guard.requestClose}
      />
    )
  }

  return (
    <Dialog
      open={guard.isOpen}
      onClose={onClose}
      title="New transfer"
      returnFocusTo={returnFocusTo}
      closeDisabled={flow.isSending}
      onCloseRequest={guard.requestClose}
      subheader={
        sent || guard.confirmingDiscard ? undefined : (
          <Stepper
            steps={STEPS.map((s) => s.label)}
            currentIndex={flow.stepIndex}
          />
        )
      }
      footer={renderFooter()}
    >
      {/* Not one ternary with the form: this region has to stay in the page,
          empty, so that what later appears in it is announced. */}
      <div
        aria-live="polite"
        className={guard.confirmingDiscard ? styles.confirm : undefined}
      >
        {guard.confirmingDiscard && (
          <h3 className={styles.confirmTitle}>Discard this transfer?</h3>
        )}
        {sent && (
          <SuccessPanel
            transfer={sent}
            onDone={guard.close}
            onAnother={flow.startAnother}
          />
        )}
      </div>
      {!sent && !guard.confirmingDiscard && (
        <TransferForm
          id={formId}
          form={flow.form}
          step={flow.step}
          sendError={flow.sendError}
          onSubmit={flow.submitStep}
        />
      )}
    </Dialog>
  )
}
