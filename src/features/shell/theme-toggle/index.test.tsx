import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ThemeToggle } from '@/features/shell/theme-toggle'

it('switches the theme instantly and remembers it', async () => {
  const user = userEvent.setup()
  render(<ThemeToggle />)
  const toggle = screen.getByRole('button', { name: 'Dark mode' })
  expect(toggle).toHaveAttribute('aria-pressed', 'false')

  await user.click(toggle)

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  expect(localStorage.getItem('meridian-theme')).toBe('dark')
  expect(toggle).toHaveAttribute('aria-pressed', 'true')

  await user.click(toggle)

  expect(document.documentElement).toHaveAttribute('data-theme', 'light')
})
