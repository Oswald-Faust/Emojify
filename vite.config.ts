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
          // Améliore le débogage en préservant les noms de fichiers originaux
          jsxRuntime: 'automatic',
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
        include: ['react', 'react-dom', 'react-router-dom', 'fabric'],
        exclude: [],
      },
      // Configuration des source maps pour le développement
      // Par défaut, Vite génère des source maps en mode dev, mais on s'assure qu'elles sont correctes
      css: {
        devSourcemap: true,
      },
      // S'assure que les source maps sont générées en mode développement
      esbuild: {
        sourcemap: true,
      },
      build: {
        // Améliore la stabilité du build
        sourcemap: false, // Pas besoin en production
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
    };
});
