import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist/desktop',
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      external: ['electron']
    }
  },
  server: {
    port: 5174,
    host: 'localhost',
    https: false
  },
  define: {
    'process.env.PLATFORM': JSON.stringify('desktop')
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
