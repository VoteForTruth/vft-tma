import { useEffect } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { backButton } from '@tma.js/sdk-react';

import { useI18n } from './i18n';
import { navigate, useRoute } from './router';
import { Feed } from './screens/Feed';
import { Profile } from './screens/Profile';
import { StatementScreen } from './screens/StatementScreen';

export default function App({ inTelegram }: { inTelegram: boolean }) {
  const route = useRoute();
  const { t, lang, setLang } = useI18n();
  const isRoot = route.name === 'feed';

  // Telegram's native back button replaces an in-app one
  useEffect(() => {
    if (!inTelegram) return;
    if (isRoot) {
      backButton.hide();
      return;
    }
    backButton.show();
    return backButton.onClick(() => window.history.back());
  }, [inTelegram, isRoot]);

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pt-3 pb-8">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {!isRoot && !inTelegram && (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="text-link"
              aria-label="Back"
            >
              ←
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate({ name: 'feed' })}
            className="truncate text-[17px] font-semibold"
          >
            {t.appName}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            className="rounded-md px-2 py-1 text-sm text-hint uppercase"
          >
            {lang === 'ru' ? 'en' : 'ru'}
          </button>
          <TonConnectButton />
        </div>
      </header>

      <main>
        {route.name === 'feed' && <Feed />}
        {route.name === 'statement' && (
          <StatementScreen address={route.address} />
        )}
        {route.name === 'profile' && <Profile />}
      </main>
    </div>
  );
}
