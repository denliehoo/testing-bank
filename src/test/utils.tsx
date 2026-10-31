import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import { formatMoney } from '@/lib/format'

/** The whole app with its own query cache, so no test sees another's data.
 * Retries are off so a failing request shows its error straight away. */
export function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
  return { user }
}

/** The app, once the dashboard has loaded. While it loads there's a disabled
 * placeholder `New transfer` button, so tests that click things wait for the
 * greeting first. */
export async function renderDashboard() {
  const app = renderApp()
  await screen.findByRole('heading', { name: /Good evening/ })
  return app
}

/** `formatMoney` puts a non-breaking space after "SGD"; Testing Library turns
 * those into plain spaces in the page text but not in what we search for. */
export function money(amount: number): string {
  return formatMoney(amount).replace(/\s/g, ' ')
}
