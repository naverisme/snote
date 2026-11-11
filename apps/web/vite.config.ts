import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/v2': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
