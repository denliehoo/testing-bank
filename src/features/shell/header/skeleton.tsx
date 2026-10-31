import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

/** Neutral stand-in for the header while the brand colour isn't known yet. */
export function HeaderSkeleton() {
  return (
    <div className={styles.header}>
      <div className={styles.brand}>
        <Skeleton width="var(--space-8)" height="var(--space-8)" />
        <Skeleton width="6rem" height="1.25rem" />
      </div>
      <div className={styles.actions}>
        <Skeleton width="var(--tap-target)" height="var(--tap-target)" />
        <Skeleton width="var(--space-10)" height="var(--space-10)" />
      </div>
    </div>
  )
}
