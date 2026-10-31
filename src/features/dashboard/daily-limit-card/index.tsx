import { formatMoney } from '@/lib/format'
import styles from './index.module.css'

interface DailyLimitCardProps {
  limit: number
  remaining: number
}

export function DailyLimitCard({ limit, remaining }: DailyLimitCardProps) {
  // Derived, not stored. Clamped so the bar can't be drawn past its ends.
  const used = Math.min(Math.max(limit - remaining, 0), limit)

  return (
    <section aria-labelledby="daily-limit-heading" className={styles.card}>
      <h2 id="daily-limit-heading" className={styles.heading}>
        Daily limit
      </h2>
      <p className={styles.remaining}>
        <span className={styles.amount}>{formatMoney(remaining)}</span>{' '}
        <span className={styles.suffix}>remaining today</span>
      </p>
      {/* The native element is already a progressbar for assistive tech. */}
      <progress
        className={styles.bar}
        value={used}
        max={limit}
        aria-label="Daily limit used"
        aria-valuetext={`${formatMoney(used)} of ${formatMoney(limit)} used`}
      />
      <p className={styles.note}>Resets daily. Applies to all transfers.</p>
    </section>
  )
}
