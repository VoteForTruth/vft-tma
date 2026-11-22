import { type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { ToastProvider } from '@/components/Toast';
import { config } from '@/config';
import { I18nProvider, type Lang } from '@/i18n';

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
        // the app shows its own "confirm in the wallet" state and result toast
        actionsConfiguration={{ modals: [], notifications: [] }}
      >
        <I18nProvider initial={lang}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}
