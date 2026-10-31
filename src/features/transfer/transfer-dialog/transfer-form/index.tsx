import { FormProvider } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'
import { InlineError } from '@/components/inline-error'
import type { TransferFormValues } from '@/features/transfer/schema'
import type { Step } from '@/features/transfer/transfer-dialog/steps'
import styles from './index.module.css'

interface TransferFormProps {
  /** Lets the footer's submit button belong to this form. */
  id: string
  form: UseFormReturn<TransferFormValues>
  step: Step
  sendError?: string | null
  onSubmit: () => void
}

/** The current step's fields, as one form. */
export function TransferForm({ id, form, step, sendError, onSubmit }: TransferFormProps) {
  return (
    <FormProvider {...form}>
      <form
        id={id}
        noValidate
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <h3 className={styles.title}>{step.title}</h3>
        {sendError && <InlineError message={sendError} />}
        <step.Content />
      </form>
    </FormProvider>
  )
}
