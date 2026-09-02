import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: true,
  },
})

// Debug build: keep source maps available while tracing the production render exception.
