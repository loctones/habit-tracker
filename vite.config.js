import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for habit-tracker.
 *
 * Builds to a single self-contained HTML file so the app can be
 * opened directly in a browser without a server. The base path is
 * set to './' so asset paths resolve correctly from the filesystem
 * and from GitHub Pages.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000, // Inline all assets into the HTML file
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
  base: './',
});
