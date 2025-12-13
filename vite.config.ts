import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { codecovVitePlugin } from '@codecov/vite-plugin';

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
        // Codecov Bundle Analysis plugin
        // Uploads bundle stats to Codecov for PR bundle size tracking
        // Only enabled when CODECOV_TOKEN is available (CI environment)
        codecovVitePlugin({
          enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
          bundleName: 'infographix-genai',
          uploadToken: process.env.CODECOV_TOKEN,
          // For public repos using GitHub Actions OIDC (tokenless)
          gitService: 'github',
        }),
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
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        // Output JUnit XML for Codecov Test Analytics
        reporters: ['default', 'junit'],
        outputFile: {
          junit: './coverage/junit.xml',
        },
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
          reportsDirectory: './coverage',
          exclude: [
            'node_modules/**',
            'src/test/**',
            '**/*.d.ts',
            '**/*.config.*',
            '**/mockData/**',
            'dist/**',
          ],
          all: true,
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      },
    };
});
