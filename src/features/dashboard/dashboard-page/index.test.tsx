import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { money, renderApp, renderDashboard } from '@/test/utils'
import { server } from '@/test/setup'

describe('dashboard', () => {
  it('searches all transactions by description or category, with a count', async () => {
    const { user } = await renderDashboard()
    const search = screen.getByRole('searchbox', { name: 'Search transactions' })

    // By description.
    await user.type(search, 'grab')
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(screen.getByText('Grab')).toBeInTheDocument()
    expect(screen.queryByText('Spotify')).not.toBeInTheDocument()

    // By category, including a match older than the 8 rows first shown.
    await user.clear(search)
    await user.type(search, 'dining')
    expect(await screen.findByText('2 results')).toBeInTheDocument()
    expect(screen.getByText('Kopitiam Corner')).toBeInTheDocument()
    expect(screen.getByText('Coffee Bean & Tea Leaf')).toBeInTheDocument()

    // A match that is only in the older transactions.
    await user.clear(search)
    await user.type(search, 'netflix')
    expect(await screen.findByText('Netflix')).toBeInTheDocument()

    // More matches than rows: the list stays capped, and the count says so.
    await user.clear(search)
    await user.type(search, 'o')
    expect(await screen.findByText('8+ results')).toBeInTheDocument()
    expect(
      within(
        screen.getByRole('region', { name: 'Recent transactions' }),
      ).getAllByRole('listitem'),
    ).toHaveLength(8)

    // Nothing matches.
    await user.clear(search)
    await user.type(search, 'zzz')
    expect(
      await screen.findByText('No transactions match your search.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByText('Spotify')).toBeInTheDocument()
  })

  it("doesn't show an earlier search's results for a new one", async () => {
    const { user } = await renderDashboard()
    const search = screen.getByRole('searchbox', { name: 'Search transactions' })

    await user.type(search, 'q')
    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(screen.getByText('Uniqlo')).toBeInTheDocument()

    // Clearing goes straight back to the recent list, and starting another
    // search must not bring the old rows back while its own load.
    await user.clear(search)
    expect(screen.getByText('Spotify')).toBeInTheDocument()
    await user.type(search, 't')
    expect(screen.getByText('Spotify')).toBeInTheDocument()
    expect(screen.queryByText('1 result')).not.toBeInTheDocument()
    expect(await screen.findByText('8+ results')).toBeInTheDocument()
  })

  it('shows a search error inside the panel, and Retry recovers', async () => {
    // Only the first search request fails (so Retry works); the dashboard's
    // own list, which has no `q`, loads normally.
    let failed = false
    server.use(
      http.get('*/api/transactions', ({ request }) => {
        if (failed || !new URL(request.url).searchParams.has('q')) return
        failed = true
        return HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        )
      }),
    )
    const { user } = await renderDashboard()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search transactions' }),
      'grab',
    )

    expect(
      await screen.findByText("We couldn't search your transactions."),
    ).toBeInTheDocument()
    // The rest of the dashboard is still there.
    expect(
      screen.queryByText("We couldn't load your dashboard."),
    ).not.toBeInTheDocument()
    expect(screen.getByText(money(4280.55))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('1 result')).toBeInTheDocument()
    expect(screen.getByText('Grab')).toBeInTheDocument()
  })

  it("doesn't claim there are no matches for a shorter search", async () => {
    const { user } = await renderDashboard()
    const search = screen.getByRole('searchbox', { name: 'Search transactions' })

    await user.type(search, 'qwe')
    expect(
      await screen.findByText('No transactions match your search.'),
    ).toBeInTheDocument()

    // `q` is a different search: the empty result for `qwe` must not show.
    await user.clear(search)
    await user.type(search, 'q')
    expect(
      screen.queryByText('No transactions match your search.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Spotify')).toBeInTheDocument()
    expect(await screen.findByText('1 result')).toBeInTheDocument()
  })

  it("can't start a transfer when there is no account to send from", async () => {
    server.use(
      http.get('*/api/accounts', () => HttpResponse.json({ accounts: [] })),
    )
    renderApp()

    expect(await screen.findByText('Good evening, Ava')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New transfer' })).toBeDisabled()
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
