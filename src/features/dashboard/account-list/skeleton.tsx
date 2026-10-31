import { Skeleton } from '@/components/skeleton'
import styles from './index.module.css'

export function AccountListSkeleton() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        <Skeleton width="6rem" />
      </h2>
      <ul className={styles.grid}>
        {[0, 1, 2].map((key) => (
          <li key={key} className={styles.card}>
            <span className={styles.name}>
              <Skeleton width="8rem" />
            </span>
            <span className={styles.number}>
              <Skeleton width="5rem" />
            </span>
            <span className={styles.balance}>
              <Skeleton width="9rem" />
            </span>
            {/* The real credit card has an extra "Amount due" line. */}
            {key === 2 && (
              <span className={styles.due}>
                <Skeleton width="5rem" />
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
