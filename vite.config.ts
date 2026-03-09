import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/robot-defense/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  server: {
    port: 3000,
  },
});
