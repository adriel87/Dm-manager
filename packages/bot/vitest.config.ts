import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    root: resolve(__dirname),
    include: ['__test__/**/*.test.ts'],
  },
})
