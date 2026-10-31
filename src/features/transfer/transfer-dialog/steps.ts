import type { ReactNode } from 'react'
import { AmountStep } from '@/features/transfer/amount-step'
import { RecipientStep } from '@/features/transfer/recipient-step'
import { ReviewStep } from '@/features/transfer/review-step'
import type { TransferFormValues } from '@/features/transfer/schema'

export interface Step {
  label: string
  title: string
  /** The form fields the step owns: Continue validates just those. */
  fields: (keyof TransferFormValues)[]
  Content: () => ReactNode
}

export const STEPS: Step[] = [
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
