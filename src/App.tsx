import { Button } from '@/components/button'
import { Layout } from '@/components/layout'
import { useDashboard } from '@/features/dashboard/use-dashboard'
import { Header } from '@/features/shell/header'
import { formatMoney } from '@/lib/format'
import { useDefaultSegment } from '@/lib/preferences'

// Temporary: shows the dashboard data flowing through until step 3 builds the UI.
function DashboardPreview() {
  const { data, isError, retry } = useDashboard()
  useDefaultSegment(data?.customer.segment)

  if (isError) {
    return (
      <div role="alert">
        <p>We couldn&apos;t load your dashboard.</p>
        <Button onClick={retry}>Retry</Button>
      </div>
    )
  }
  if (!data) return <p>Loading…</p>

  return (
    <p>
      Total {formatMoney(data.totalAvailable)} · Remaining limit{' '}
      {formatMoney(data.remainingDailyLimit)} · {data.transactions.length}{' '}
      transactions
    </p>
  )
}

export default function App() {
  return (
    <Layout header={<Header />}>
      <DashboardPreview />
    </Layout>
  )
}
