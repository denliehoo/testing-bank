import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

export function TransactionItemSkeleton() {
  return (
    <li className={styles.row}>
      <div className={styles.details}>
        <span className={styles.description}>
          <Skeleton className={styles.skeletonDescription} />
        </span>
        <span className={styles.meta}>
          <Skeleton className={styles.skeletonMeta} />
        </span>
      </div>
      <div className={styles.side}>
        <span className={styles.amount}>
          <Skeleton className={styles.skeletonAmount} />
        </span>
      </div>
    </li>
  )
}
