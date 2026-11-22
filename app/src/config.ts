// Build-time settings, see .env.example.
export type Network = 'mainnet' | 'testnet';

export const config = {
  network: (import.meta.env.VITE_NETWORK ?? 'testnet') as Network,
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8080',
  master: import.meta.env.VITE_MASTER ?? '',
  // TON Connect wallets download the manifest by URL, so it must be public
  manifestUrl:
    import.meta.env.VITE_MANIFEST_URL ??
    'https://ton-blockchain.github.io/acton/tonconnect-manifest.json',
  // t.me link of the Mini App, used for share links: https://t.me/<bot>/<app>
  appLink: import.meta.env.VITE_APP_LINK ?? '',
};
