import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  base: '/graph-studio/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/graph-studio/graph': 'http://localhost:3001',
      '/graph-studio/routes': 'http://localhost:3001',
      '/graph-studio/health': 'http://localhost:3001',
      '/graph-studio/stream': 'http://localhost:3001',
    },
  },
});

