import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { money, renderApp } from '@/test/render-app'
import { server } from '@/test/setup'

describe('dashboard', () => {
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
