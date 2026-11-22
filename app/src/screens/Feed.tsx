import { useState } from 'react';

import { useFeed, type FeedSort } from '@/api';
import { StatementCard } from '@/components/StatementCard';
import { Empty, LoadError, Loading } from '@/components/State';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

export function Feed() {
  const { t } = useI18n();
  const [sort, setSort] = useState<FeedSort>('weight');
  const feed = useFeed(sort);

  const tabs: { id: FeedSort; label: string }[] = [
    { id: 'weight', label: t.feed.important },
    { id: 'new', label: t.feed.new },
    { id: 'active', label: t.feed.active },
  ];

  return (
    <div className="space-y-3">
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

      {feed.isPending && <Loading />}
      {feed.isError && <LoadError onRetry={() => feed.refetch()} />}
      {feed.data?.statements.length === 0 && <Empty text={t.feed.empty} />}
      {feed.data?.statements.map((s) => (
        <StatementCard key={s.address} statement={s} showResult />
      ))}
    </div>
  );
}
