import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          overlay: true,
        },
      },
      plugins: [
        react({
          // Améliore la compatibilité avec Fast Refresh
          fastRefresh: true,
          // Exclut les fichiers problématiques du Fast Refresh si nécessaire
          exclude: /node_modules/,
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Optimisations pour éviter les problèmes de cache
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
      },
      build: {
        // Améliore la stabilité du build
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
    };
});
