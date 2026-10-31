import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { SegmentSwitch } from '@/features/shell/segment-switch'

it('switches the segment and remembers it', async () => {
  const user = userEvent.setup()
  render(<SegmentSwitch />)

  await user.click(screen.getByRole('button', { name: 'Premium' }))

  expect(document.documentElement).toHaveAttribute('data-segment', 'premium')
  expect(localStorage.getItem('meridian-segment')).toBe('premium')
  expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
