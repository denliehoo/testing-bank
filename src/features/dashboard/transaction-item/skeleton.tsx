import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

export function TransactionItemSkeleton() {
  return (
    <li className={styles.row}>
      <div className={styles.details}>
        <span className={styles.description}>
          <Skeleton width="10rem" />
        </span>
        <span className={styles.meta}>
          <Skeleton width="7rem" />
        </span>
      </div>
      <div className={styles.side}>
        <span className={styles.amount}>
          <Skeleton width="5rem" />
        </span>
      </div>
    </li>
  )
}
