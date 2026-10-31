import { Layout } from '@/components/layout'
import { Header } from '@/features/shell/header'

export default function App() {
  return (
    <Layout header={<Header />}>
      {/* Placeholder until the dashboard is built (step 3). */}
      <p>Dashboard coming soon.</p>
    </Layout>
  )
}
