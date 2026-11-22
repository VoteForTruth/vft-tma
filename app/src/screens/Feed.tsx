import { useState } from 'react';

import { useFeed, type FeedSort } from '@/api';
import { CreateSheet } from '@/components/ActionSheets';
import { PendingList } from '@/components/Pending';
import { StatementCard } from '@/components/StatementCard';
import { Empty, LoadError, Loading } from '@/components/State';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { langName } from '@/lang';

export function Feed() {
  const { t, lang } = useI18n();
  const [sort, setSort] = useState<FeedSort>('weight');
  const [allLangs, setAllLangs] = useState(false);
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

      <div className="flex justify-end px-1 text-[13px]">
        <button
          type="button"
          onClick={() => setAllLangs(!allLangs)}
          className="text-link"
        >
          {allLangs ? t.feed.onlyMyLang(langName(lang, lang)) : t.feed.allLangs}
        </button>
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
