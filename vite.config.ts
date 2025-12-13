import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        visualizer({
          filename: './dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // 'treemap' | 'sunburst' | 'network'
        }) as any,
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        chunkSizeWarningLimit: 700, // Export libs chunk is large but lazy-loaded on demand
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Only split export libraries (truly lazy-loaded via dynamic import)
              // This ensures React and its dependents (lucide-react) are bundled together correctly
              // while still optimizing initial load by lazy-loading export functionality
              if (id.includes('jspdf') || id.includes('jszip') || id.includes('html2canvas')) {
                return 'export-libs';
              }
              // Let Vite handle everything else optimally with proper dependency ordering
              return undefined;
            },
          },
        },
      },
    };
});
