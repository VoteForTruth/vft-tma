import { useState } from 'react';

import { useFeed, type FeedSort } from '@/api';
import { CreateSheet } from '@/components/ActionSheets';
import { PendingList } from '@/components/Pending';
import { StatementCard } from '@/components/StatementCard';
import { Empty, LoadError, Loading } from '@/components/State';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { langName } from '@/lang';

const ALL_LANGS_KEY = 'vft:feed-all-langs';

export function Feed() {
  const { t, lang } = useI18n();
  const [sort, setSort] = useState<FeedSort>('weight');
  const [allLangs, setAllLangsState] = useState(() => {
    try {
      return localStorage.getItem(ALL_LANGS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const setAllLangs = (all: boolean) => {
    setAllLangsState(all);
    try {
      localStorage.setItem(ALL_LANGS_KEY, all ? '1' : '0');
    } catch {
      // storage may be unavailable; the choice then lasts for the session
    }
  };
  const [asking, setAsking] = useState(false);
  const feed = useFeed(sort, allLangs ? null : lang);

  const tabs: { id: FeedSort; label: string }[] = [
    { id: 'weight', label: t.feed.important },
    { id: 'new', label: t.feed.new },
    { id: 'active', label: t.feed.active },
  ];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="w-full rounded-2xl bg-primary py-3 font-medium text-primary-foreground"
      >
        {t.actions.ask}
      </button>
      <div className="flex gap-1 rounded-xl bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSort(tab.id)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-sm',
              sort === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-hint',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* which topics are shown: in the interface language or in all; the
          selected option is highlighted, like the sort tabs */}
      <div className="flex justify-end">
        <div className="flex gap-1 rounded-lg bg-card p-0.5 text-[13px]">
          {[false, true].map((all) => (
            <button
              key={String(all)}
              type="button"
              onClick={() => setAllLangs(all)}
              className={cn(
                'rounded-md px-2.5 py-1',
                allLangs === all ? 'bg-border text-foreground' : 'text-hint',
              )}
            >
              {all ? t.feed.allLangs : langName(lang, lang)}
            </button>
          ))}
        </div>
      </div>

      {feed.isPending && <Loading />}
      {feed.isError && <LoadError onRetry={() => feed.refetch()} />}
      <PendingList parent={null} />
      {feed.data?.statements.length === 0 && <Empty text={t.feed.empty} />}
      {feed.data?.statements.map((s) => (
        <StatementCard key={s.address} statement={s} showResult />
      ))}

      {asking && (
        <CreateSheet parent={null} pro onClose={() => setAsking(false)} />
      )}
    </div>
  );
}
