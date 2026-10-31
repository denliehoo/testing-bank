import type { ReactNode } from 'react'
import { useState } from 'react'
import { InlineError } from '@/components/inline-error'
import { Layout } from '@/components/layout'
import { AccountList } from '@/features/dashboard/account-list'
import { BalanceHero } from '@/features/dashboard/balance-hero'
import { DailyLimitCard } from '@/features/dashboard/daily-limit-card'
import { DailyLimitCardSkeleton } from '@/features/dashboard/daily-limit-card/skeleton'
import { RecentTransactions } from '@/features/dashboard/recent-transactions'
import { useDashboard } from '@/features/dashboard/use-dashboard'
import type { DashboardData } from '@/features/dashboard/use-dashboard'
import { Header } from '@/features/shell/header'
import { HeaderSkeleton } from '@/features/shell/header/skeleton'
import { SegmentSwitch } from '@/features/shell/segment-switch'
import { hasStoredSegment, useDefaultSegment } from '@/lib/preferences'
import { DashboardSkeleton, GreetingSkeleton } from './skeleton'
import styles from './index.module.css'

function Greeting({ firstName }: { firstName: string }) {
  return (
    <div className={styles.greeting}>
      <h1 className={styles.title}>Good evening, {firstName}</h1>
      {/* Below 1024px the switch lives here; the header has it above that. */}
      <div className={styles.segment}>
        <SegmentSwitch />
      </div>
    </div>
  )
}

function DashboardContent({ data }: { data: DashboardData }) {
  return (
    <>
      <BalanceHero
        total={data.totalAvailable}
        depositAccountCount={data.depositAccountCount}
      />
      <AccountList accounts={data.accounts} />
      <RecentTransactions transactions={data.transactions} />
    </>
  )
}

export function DashboardPage() {
  const { data, customer, isError, retry } = useDashboard()
  const [hadStoredSegment] = useState(hasStoredSegment)
  useDefaultSegment(customer?.segment)

  // If the user hasn't chosen a segment yet, the API's default decides the
  // brand colour. Until the customer arrives, show only neutral placeholders
  // rather than a colour that might be wrong. If the request fails we stop
  // waiting and fall back to the default (retail) with the error.
  const awaitingSegment = !hadStoredSegment && !customer && !isError

  let intro: ReactNode = <GreetingSkeleton />
  let main: ReactNode = <DashboardSkeleton />
  let rail: ReactNode = (
    <div className={styles.rail}>
      <DailyLimitCardSkeleton />
    </div>
  )
  if (isError) {
    intro = undefined
    main = (
      <InlineError message="We couldn't load your dashboard." onRetry={retry} />
    )
    rail = undefined
  } else if (data) {
    intro = <Greeting firstName={data.customer.firstName} />
    main = <DashboardContent data={data} />
    rail = (
      <div className={styles.rail}>
        <DailyLimitCard remaining={data.remainingDailyLimit} />
      </div>
    )
  }

  return (
    <Layout
      header={awaitingSegment ? <HeaderSkeleton /> : <Header />}
      intro={intro}
      rail={rail}
    >
      <div className={styles.page}>{main}</div>
    </Layout>
  )
}
