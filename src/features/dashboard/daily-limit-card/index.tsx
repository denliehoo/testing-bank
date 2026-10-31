import { formatMoney } from '@/lib/format'
import styles from './index.module.css'

export function DailyLimitCard({ remaining }: { remaining: number }) {
  return (
    <section aria-labelledby="daily-limit-heading" className={styles.card}>
      <h2 id="daily-limit-heading" className={styles.heading}>
        Daily limit
      </h2>
      <p className={styles.remaining}>
        <span className={styles.amount}>{formatMoney(remaining)}</span>{' '}
        <span className={styles.suffix}>remaining today</span>
      </p>
      <p className={styles.note}>Resets daily. Applies to all transfers.</p>
    </section>
  )
}
