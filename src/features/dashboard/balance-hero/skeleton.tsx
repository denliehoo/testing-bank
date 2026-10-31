import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { PlusIcon } from './index'
import styles from './index.module.css'

export function BalanceHeroSkeleton() {
  return (
    <section className={styles.hero}>
      <div>
        <p className={styles.label}>
          <Skeleton width="8rem" />
        </p>
        <p className={styles.total}>
          <Skeleton width="14rem" />
        </p>
        <p className={styles.caption}>
          <Skeleton width="10rem" />
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
