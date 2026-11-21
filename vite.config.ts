import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-lucide';
            }
            if (id.includes('src/data/postsData.json')) {
              return 'data-knowledge-posts';
            }
            if (id.includes('src/data/allCalculatorsData.json')) {
              return 'data-all-calculators';
            }
            if (id.includes('src/data/calculatorRegistry/batch4')) {
              return 'calculator-specs-batch4';
            }
            if (id.includes('src/data/calculatorRegistry/')) {
              return 'calculator-specs-registry';
            }
            if (id.includes('src/data/editorial/batch4Finance')) {
              return 'editorial-batch4-fin';
            }
            if (id.includes('src/data/editorial/batch4Math')) {
              return 'editorial-batch4-math';
            }
            if (id.includes('src/data/editorial/batch4Health')) {
              return 'editorial-batch4-health';
            }
            if (id.includes('src/data/editorial/batch4Faqs')) {
              return 'faqs-batch4';
            }
            if (id.includes('src/data/editorial/') || id.includes('src/data/calculatorFaqs') || id.includes('src/data/calculatorEditorial')) {
              return 'editorial-core-and-faqs';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
