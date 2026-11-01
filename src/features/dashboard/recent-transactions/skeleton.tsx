import { Skeleton } from '@/components/skeleton'
import { TransactionItemSkeleton } from '@/features/dashboard/transaction-item/skeleton'
import styles from './index.module.css'

// Same number of rows as the dashboard requests (limit=8).
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7]

export function RecentTransactionsSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          <Skeleton className={styles.skeletonHeading} />
        </h2>
        <div className={styles.search}>
          <Skeleton className={styles.skeletonSearch} />
        </div>
      </div>
      <div className={styles.body}>
        <ul className={styles.list}>
          {ROWS.map((key) => (
            <TransactionItemSkeleton key={key} />
          ))}
        </ul>
      </div>
    </section>
  )
}
