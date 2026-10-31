import type { RefObject } from 'react'
import { Button } from '@/components/button'
import { formatMoney } from '@/lib/format'
import styles from './index.module.css'

interface BalanceHeroProps {
  total: number
  depositAccountCount: number
  onNewTransfer: () => void
  /** So the transfer dialog can give focus back to this button when it closes. */
  newTransferRef?: RefObject<HTMLButtonElement | null>
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function BalanceHero({
  total,
  depositAccountCount,
  onNewTransfer,
  newTransferRef,
}: BalanceHeroProps) {
  return (
    <section className={styles.hero} aria-label="Total available">
      <div>
        <p className={styles.label}>Total available</p>
        <p className={styles.total}>{formatMoney(total)}</p>
        <p className={styles.caption}>
          Across {depositAccountCount} deposit{' '}
          {depositAccountCount === 1 ? 'account' : 'accounts'}
        </p>
      </div>
      <div className={styles.cta}>
        <Button
          ref={newTransferRef}
          className={styles.button}
          onClick={onNewTransfer}
        >
          <PlusIcon />
          New transfer
        </Button>
      </div>
    </section>
  )
}
