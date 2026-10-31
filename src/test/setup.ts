import '@testing-library/jest-dom/vitest'
import './dialog-stub'
import { cleanup, configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { handlers, resetMockDb } from '../mocks/handlers'

// The mock API answers after a short artificial delay, and a transfer waits
// for the dashboard to refetch, so the default 1s isn't enough.
configure({ asyncUtilTimeout: 5000 })

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => resetMockDb())
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
