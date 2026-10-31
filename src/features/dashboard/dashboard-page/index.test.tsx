import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { money, renderApp, renderDashboard } from '@/test/utils'
import { server } from '@/test/setup'

describe('dashboard', () => {
  it('filters transactions by description or category, with a count', async () => {
    const { user } = await renderDashboard()
    const search = screen.getByRole('searchbox', { name: 'Search transactions' })

    // By description.
    await user.type(search, 'grab')
    expect(screen.getByText('Grab')).toBeInTheDocument()
    expect(screen.queryByText('Spotify')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 result')

    // By category: "dining" is Kopitiam Corner's category, not in its name.
    await user.clear(search)
    await user.type(search, 'dining')
    expect(screen.getByText('Kopitiam Corner')).toBeInTheDocument()

    // Nothing matches.
    await user.clear(search)
    await user.type(search, 'zzz')
    expect(
      screen.getByText('No transactions match your search.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByText('Spotify')).toBeInTheDocument()
  })

  it('shows an error when a request fails, and Retry loads it', async () => {
    server.use(
      http.get(
        '*/api/accounts',
        () =>
          HttpResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
            { status: 500 },
          ),
        // Only the first call fails, so Retry gets the real data.
        { once: true },
      ),
    )
    const { user } = renderApp()

    expect(
      await screen.findByText("We couldn't load your dashboard."),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText(money(4280.55))).toBeInTheDocument()
    expect(
      screen.queryByText("We couldn't load your dashboard."),
    ).not.toBeInTheDocument()
  })
})
