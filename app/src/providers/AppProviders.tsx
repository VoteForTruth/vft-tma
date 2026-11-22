import { type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';

import { ToastProvider } from '@/components/Toast';
import { config } from '@/config';
import { I18nProvider, type Lang } from '@/i18n';

// The standard TON Connect window (owner's decision), painted in the brand
// colors: dark, violet accent, the same as the app and the landing.
const tonConnectUI = {
  theme: THEME.DARK,
  colorsSet: {
    [THEME.DARK]: {
      connectButton: { background: '#9a6bff', foreground: '#ffffff' },
      accent: '#9a6bff',
      background: {
        primary: '#141124',
        secondary: '#0e0c18',
        segment: '#1c1733',
        tint: '#241f3a',
        qr: '#ffffff',
      },
      text: { primary: '#eeeaff', secondary: '#8f88ad' },
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export function AppProviders({
  lang,
  children,
}: PropsWithChildren<{ lang: Lang }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <TonConnectUIProvider
        manifestUrl={config.manifestUrl}
        language={lang}
        uiPreferences={tonConnectUI}
      >
        <I18nProvider initial={lang}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}
