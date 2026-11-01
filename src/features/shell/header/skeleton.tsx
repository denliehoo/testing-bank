import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

/** Neutral stand-in for the header while the brand colour isn't known yet. */
export function HeaderSkeleton() {
  return (
    <div className={styles.header}>
      <div className={styles.brand}>
        <Skeleton className={styles.skeletonMark} />
        <Skeleton className={styles.skeletonName} />
      </div>
      <div className={styles.actions}>
        <Skeleton className={styles.skeletonTheme} />
        <Skeleton className={styles.skeletonAvatar} />
      </div>
    </div>
  )
}
