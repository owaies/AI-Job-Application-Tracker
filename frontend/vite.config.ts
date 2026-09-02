import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: true,
  },
})

// Debug build: preserve source maps while tracing the production render exception.
