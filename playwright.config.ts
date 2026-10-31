import { defineConfig } from '@playwright/test'

// Port 4179 is only used by this suite, so a leftover preview server on
// Vite's default port can't be mistaken for the build under test.
const PORT = 4179

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: `http://localhost:${PORT}` },
  // Tests run against the production build, as deployed.
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    timeout: 120_000,
  },
})
