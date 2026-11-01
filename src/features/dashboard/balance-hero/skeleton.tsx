import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { PlusIcon } from './index'
import styles from './index.module.css'

export function BalanceHeroSkeleton() {
  return (
    <section className={`${styles.hero} ${styles.loading}`}>
      <div>
        <p className={styles.label}>
          <Skeleton className={styles.skeletonLabel} />
        </p>
        <p className={styles.total}>
          <Skeleton className={styles.skeletonTotal} />
        </p>
        <p className={styles.caption}>
          <Skeleton className={styles.skeletonCaption} />
        </p>
      </div>
      <div className={styles.cta}>
        <Button className={styles.button} disabled>
          <PlusIcon />
          New transfer
        </Button>
      </div>
    </section>
  )
}
