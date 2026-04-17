import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path para GitHub Pages: https://alexblanlop.github.io/OperacionTuring/
export default defineConfig({
  plugins: [react()],
  base: '/OperacionTuring/',
})
