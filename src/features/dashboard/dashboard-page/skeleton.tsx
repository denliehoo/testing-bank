import { Skeleton } from '@/components/skeleton'
import { VisuallyHidden } from '@/components/visually-hidden'
import { AccountListSkeleton } from '@/features/dashboard/account-list/skeleton'
import { BalanceHeroSkeleton } from '@/features/dashboard/balance-hero/skeleton'
import { RecentTransactionsSkeleton } from '@/features/dashboard/recent-transactions/skeleton'
import styles from './index.module.css'

export function GreetingSkeleton() {
  return (
    <div className={styles.greeting}>
      <h1 className={styles.title}>
        <Skeleton className={styles.skeletonTitle} />
      </h1>
      <div className={styles.segment}>
        <Skeleton className={styles.skeletonSegment} />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <>
      {/* Absolutely positioned, so it takes no space in the page grid. */}
      <VisuallyHidden role="status">Loading your dashboard</VisuallyHidden>
      <BalanceHeroSkeleton />
      <AccountListSkeleton />
      <RecentTransactionsSkeleton />
    </>
  )
}
