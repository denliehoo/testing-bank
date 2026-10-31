import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

export function DailyLimitCardSkeleton() {
  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>
        <Skeleton width="6rem" />
      </h2>
      <p className={styles.remaining}>
        <span className={styles.amount}>
          <Skeleton width="12rem" />
        </span>
      </p>
      <Skeleton height="var(--space-2)" />
      <p className={styles.note}>
        <Skeleton width="14rem" />
      </p>
    </section>
  )
}
