import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    https: false, // Set to true for WebXR on mobile devices
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  optimizeDeps: {
    include: ['aframe', 'three']
  },
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/core',
      '@scenes': '/src/scenes',
      '@components': '/src/components',
      '@utils': '/src/utils'
    }
  }
});
