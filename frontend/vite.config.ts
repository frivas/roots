import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxy for SSE
      },
      '/webhook': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || (id.includes('/react/') && !id.includes('react-router'))) return 'vendor';
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('@clerk/clerk-react')) return 'clerk';
          if (id.includes('lucide-react') || id.includes('framer-motion')) return 'ui';
        },
      },
      external: (id) => {
        // Externalize Node.js built-in modules
        const nodeBuiltins = [
          'path', 'fs', 'vm', 'url', 'util', 'http', 'https',
          'stream', 'zlib', 'net', 'tls', 'crypto', 'child_process',
          'os', 'assert'
        ];
        return nodeBuiltins.includes(id) || id.startsWith('node:');
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['jsdom'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@clerk/clerk-react'
    ],
  },
  define: {
    global: 'globalThis',
  },
});
