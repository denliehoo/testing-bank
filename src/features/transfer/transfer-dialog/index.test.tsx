import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { money, renderDashboard } from '@/test/utils'
import { server } from '@/test/setup'

/** Clicks `New transfer` and returns the dialog that opens. */
async function openTransferDialog(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'New transfer' }))
  return screen.getByRole('dialog')
}

// Seed data: checking has SGD 4,280.55, Jamie Tan is the first saved payee.
const CHECKING_BALANCE = 4280.55

/** Opens the dialog and gets through step 1 and the amount, ending on review. */
async function fillTransfer(
  user: UserEvent,
  { amount, note = '' }: { amount: string; note?: string },
) {
  const dialog = await openTransferDialog(user)

  await user.click(await within(dialog).findByRole('radio', { name: /Jamie Tan/ }))
  await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

  await user.type(within(dialog).getByLabelText('Amount (SGD)'), amount)
  if (note) await user.type(within(dialog).getByLabelText(/Note/), note)
  await user.click(within(dialog).getByRole('button', { name: 'Continue' }))

  return dialog
}

describe('transfer dialog', () => {
  it('lets the payee list be used with the keyboard', async () => {
    const { user } = await renderDashboard()
    const dialog = await openTransferDialog(user)

    const jamie = await within(dialog).findByRole('radio', { name: /Jamie Tan/ })
    jamie.focus()
    await user.keyboard('{ArrowDown}')

    // Arrow keys move through the group and select as they go.
    expect(within(dialog).getByRole('radio', { name: /Marcus Lee/ })).toBeChecked()
    expect(jamie).not.toBeChecked()

    // The group is one tab stop; Tab on to Continue and press it.
    await user.tab()
    await user.tab()
    expect(within(dialog).getByRole('button', { name: 'Continue' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(
      within(dialog).getByRole('heading', { name: 'How much?' }),
    ).toBeInTheDocument()
  })

  it('rejects an amount over the balance and sends no request', async () => {
    let requests = 0
    server.use(
      http.post('*/api/transfers', () => {
        requests += 1
        return HttpResponse.json({}, { status: 500 })
      }),
    )
    const { user } = await renderDashboard()

    const dialog = await fillTransfer(user, { amount: '99999' })

    expect(
      within(dialog).getByText(
        `Amount can't be more than your available balance (${money(CHECKING_BALANCE)}).`,
      ),
    ).toBeInTheDocument()
    // Still on the amount step: it never got to review, so nothing was sent.
    expect(
      within(dialog).getByRole('heading', { name: 'How much?' }),
    ).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it('shows the success screen and updates the dashboard', async () => {
    const { user } = await renderDashboard()

    const dialog = await fillTransfer(user, { amount: '120', note: 'Dinner' })
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirm transfer' }),
    )

    expect(await within(dialog).findByText('Transfer sent')).toBeInTheDocument()
    expect(within(dialog).getByText(money(120))).toBeInTheDocument()
    expect(within(dialog).getByText(/Jamie Tan/)).toBeInTheDocument()
    // The reference comes from the API.
    expect(within(dialog).getByText(/TRF-/)).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: 'Back to dashboard' }),
    )

    // New balance, new transaction and new remaining limit, without a reload.
    expect(
      await screen.findByText(money(CHECKING_BALANCE - 120)),
    ).toBeInTheDocument()
    expect(screen.getByText('Transfer to Jamie Tan')).toBeInTheDocument()
    expect(screen.getByText(money(5000 - 120))).toBeInTheDocument()
  })

  it('stays on review with an alert when sending fails', async () => {
    const { user } = await renderDashboard()

    // `#fail` in the note makes the mock API fail the transfer.
    const dialog = await fillTransfer(user, { amount: '120', note: '#fail' })
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirm transfer' }),
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      "Something went wrong. Your money hasn't left your account. Try again.",
    )
    expect(
      within(dialog).getByRole('heading', { name: 'Check the details' }),
    ).toBeInTheDocument()
    expect(within(dialog).queryByText('Transfer sent')).not.toBeInTheDocument()
    // Nothing was lost, and it can be tried again.
    expect(within(dialog).getByText('#fail')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Confirm transfer' }),
    ).toBeEnabled()
  })

  it("shows the API's reason when it rejects the transfer", async () => {
    server.use(
      http.post('*/api/transfers', () =>
        HttpResponse.json(
          {
            error: {
              code: 'DAILY_LIMIT_EXCEEDED',
              message: 'Amount exceeds remaining daily limit.',
              fields: { amount: 'This transfer exceeds your remaining daily limit.' },
            },
          },
          { status: 422 },
        ),
      ),
    )
    const { user } = await renderDashboard()

    const dialog = await fillTransfer(user, { amount: '120' })
    await user.click(
      within(dialog).getByRole('button', { name: 'Confirm transfer' }),
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Amount exceeds remaining daily limit.',
    )
    expect(
      within(dialog).getByRole('heading', { name: 'Check the details' }),
    ).toBeInTheDocument()
  })
})
