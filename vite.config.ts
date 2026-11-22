import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Dev only: serves tonconnect-manifest.json for whatever public address the app is
// opened from (e.g. a tunnel), since the manifest must name the app's own URL.
function devTonConnectManifest(): Plugin {
  return {
    name: 'dev-tonconnect-manifest',
    configureServer(server) {
      server.middlewares.use('/tonconnect-manifest.json', (req, res) => {
        const proto = req.headers['x-forwarded-proto'] ?? 'http';
        const origin = `${proto}://${req.headers.host}`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(
          JSON.stringify({
            url: origin,
            name: 'Vote For Truth',
            iconUrl: `${origin}/icon-180.png`,
          }),
        );
      });
    },
  };
}

export default defineConfig({
  root: 'app',
  envDir: projectRoot,
  envPrefix: ['VITE_', 'TONCENTER_'],
  plugins: [react(), tailwindcss(), devTonConnectManifest()],
  resolve: {
    alias: {
      '@wrappers': path.resolve(projectRoot, 'wrappers-ts'),
      '@': path.resolve(projectRoot, 'app/src'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: '../dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react/') || id.includes('/react-dom/'))
            return 'react';
          if (id.includes('/@ton/ton/') || id.includes('/@ton/core/'))
            return 'ton-sdk';
          if (id.includes('/@tonconnect/')) return 'tonconnect';
          return undefined;
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['.', path.resolve(projectRoot, 'wrappers-ts')],
    },
    port: 5173,
    // a quick tunnel to test inside Telegram (cloudflared --url http://127.0.0.1:5173)
    allowedHosts: ['.trycloudflare.com'],
    // the indexer API through the same origin, so one tunnel is enough
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
