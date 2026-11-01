import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

export function DailyLimitCardSkeleton() {
  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>
        <Skeleton className={styles.skeletonHeading} />
      </h2>
      <p className={styles.remaining}>
        <span className={styles.amount}>
          <Skeleton className={styles.skeletonAmount} />
        </span>
      </p>
      <Skeleton className={styles.skeletonBar} />
      <p className={styles.note}>
        <Skeleton className={styles.skeletonNote} />
      </p>
    </section>
  )
}
