import { useEffect } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { backButton } from '@tma.js/sdk-react';
import { UserRound } from 'lucide-react';

import { PendingResolver } from './components/Pending';
import { useI18n } from './i18n';
import { cn } from './lib/utils';
import { navigate, useRoute } from './router';
import { Feed } from './screens/Feed';
import { Profile } from './screens/Profile';
import { StatementScreen } from './screens/StatementScreen';

// The V logo, the same as on the landing and the bot avatar.
function Logo() {
  return (
    <span className="logo-mark grid size-7 shrink-0 place-items-center rounded-lg">
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M5 4 12 19 19 4" />
        <path d="M2.5 4h5" />
        <path d="M16.5 4h5" />
        <path d="M9 21h6" stroke="#0e0c18" />
      </svg>
    </span>
  );
}

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
            className="flex min-w-0 items-center gap-2 text-[17px] font-semibold"
            aria-label={t.appName}
          >
            <Logo />
            {/* on narrow screens the wallet button needs the room: logo only */}
            <span className="hidden truncate min-[430px]:inline">
              Vote For <span className="truth font-extrabold">Truth</span>
            </span>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* interface language: the current one is highlighted */}
          <div className="flex rounded-md bg-card p-0.5 text-xs uppercase">
            {(['ru', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  'rounded px-1.5 py-0.5',
                  lang === l ? 'bg-border text-foreground' : 'text-hint',
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate({ name: 'profile' })}
            className="rounded-md p-1 text-link"
            aria-label={t.profile.title}
          >
            <UserRound size={20} />
          </button>
          <TonConnectButton />
        </div>
      </header>

      <PendingResolver />
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
