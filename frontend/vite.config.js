import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `https://chatter-node-backend.onrender.com`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});