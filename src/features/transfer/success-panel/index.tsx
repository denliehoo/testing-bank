import type { Transfer } from '@/api/types'
import { Button } from '@/components/button'
import { formatMoney } from '@/lib/format'
import styles from './index.module.css'

interface SuccessPanelProps {
  transfer: Transfer
  onDone: () => void
  onAnother: () => void
}

export function SuccessPanel({ transfer, onDone, onAnother }: SuccessPanelProps) {
  const { recipient } = transfer

  return (
    <div className={styles.panel}>
      <svg
        className={styles.tick}
        viewBox="0 0 24 24"
        width="56"
        height="56"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <path
          d="M7 12.5l3.2 3.2L17 9"
          fill="none"
          stroke="var(--surface)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className={styles.title}>Transfer sent</h3>
      <p className={styles.amount}>{formatMoney(transfer.amount)}</p>
      <p className={styles.muted}>
        to {recipient.name} · {recipient.bank} · {recipient.accountNumberMasked}
      </p>
      <p>
        <span className={styles.muted}>Reference</span> {transfer.reference}
      </p>
      <p className={styles.muted}>The money should arrive within minutes.</p>
      <div className={styles.actions}>
        <Button onClick={onDone} autoFocus>
          Back to dashboard
        </Button>
        <Button variant="secondary" onClick={onAnother}>
          Make another transfer
        </Button>
      </div>
    </div>
  )
}
