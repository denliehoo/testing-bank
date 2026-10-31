import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // Keep in sync with `paths` in tsconfig.json and vite.config.ts.
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    // `e2e/` belongs to Playwright.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    restoreMocks: true,
    // The mock API answers after an artificial delay, and some tests make
    // several requests in a row.
    testTimeout: 15_000,
    // Same results on every machine and in CI, whatever the local timezone.
    env: { TZ: 'Asia/Singapore' },
  },
})
