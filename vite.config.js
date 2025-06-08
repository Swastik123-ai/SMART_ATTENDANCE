import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  // Remove rollupOptions.external entirely
})
