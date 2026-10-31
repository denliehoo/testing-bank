import type { ReactNode } from 'react'
import { AmountStep } from '@/features/transfer/amount-step'
import { RecipientStep } from '@/features/transfer/recipient-step'
import { ReviewStep } from '@/features/transfer/review-step'
import type { TransferFormValues } from '@/features/transfer/schema'

// `fields` are the form fields each step owns: Continue validates just those.
export const STEPS: {
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
