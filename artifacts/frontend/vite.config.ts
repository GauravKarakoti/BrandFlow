import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env variables from .env files in the current directory.
  // The third argument '' tells Vite to load all variables, not just ones prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), '');

  const rawPort = env.PORT || '5134';
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  // Provide a fallback base path
  const basePath = env.BASE_PATH || '/';

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          // Suppress "Module level directives cause errors when bundled" warnings ("use client")
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return;
          }
          // Suppress the specific sourcemap error you are seeing
          if (warning.message.includes('Error when using sourcemap for reporting an error')) {
            return;
          }
          
          // Let all other warnings pass through to the terminal
          defaultHandler(warning);
        },
      },
      sourcemap: false,
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});