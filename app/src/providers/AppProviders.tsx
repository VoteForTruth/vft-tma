import { type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

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
      <TonConnectUIProvider manifestUrl={config.manifestUrl} language={lang}>
        <I18nProvider initial={lang}>{children}</I18nProvider>
      </TonConnectUIProvider>
    </QueryClientProvider>
  );
}
