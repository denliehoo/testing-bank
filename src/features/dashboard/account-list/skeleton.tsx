import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

export function AccountListSkeleton() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        <Skeleton className={styles.skeletonHeading} />
      </h2>
      <ul className={styles.grid}>
        {[0, 1, 2].map((key) => (
          <li key={key} className={styles.card}>
            <span className={styles.name}>
              <Skeleton className={styles.skeletonName} />
            </span>
            <span className={styles.number}>
              <Skeleton className={styles.skeletonNumber} />
            </span>
            <span className={styles.balance}>
              <Skeleton className={styles.skeletonBalance} />
            </span>
            {/* The real credit card has an extra "Amount due" line. */}
            {key === 2 && (
              <span className={styles.due}>
                <Skeleton className={styles.skeletonDue} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
