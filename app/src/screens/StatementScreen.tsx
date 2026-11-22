import { useState } from 'react';

import { ApiError, useStatement, type Statement } from '@/api';
import { ResultBar } from '@/components/ResultBar';
import { StatementCard } from '@/components/StatementCard';
import { Empty, LoadError, Loading } from '@/components/State';
import { formatTon, shortAddress } from '@/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

export function StatementScreen({ address }: { address: string }) {
  const { t } = useI18n();
  const query = useStatement(address);
  const [side, setSide] = useState<'pro' | 'con'>('pro');

  if (query.isPending) return <Loading />;
  if (query.isError) {
    const status = query.error instanceof ApiError ? query.error.status : 0;
    if (status === 404) return <Empty text={t.statement.notFound} />;
    if (status === 410) return <Empty text={t.statement.hidden} />;
    return <LoadError onRetry={() => query.refetch()} />;
  }

  const { statement, pro, con } = query.data;
  const list = side === 'pro' ? pro : con;

  return (
    <div className="space-y-3">
      <Header statement={statement} />

      <div className="flex gap-1 rounded-xl bg-card p-1">
        {(['pro', 'con'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-sm',
              side === s
                ? s === 'pro'
                  ? 'bg-pro text-white'
                  : 'bg-con text-white'
                : 'text-hint',
            )}
          >
            {s === 'pro' ? t.statement.pro : t.statement.con} ·{' '}
            {s === 'pro' ? pro.length : con.length}
          </button>
        ))}
      </div>

      {list.length === 0 && <Empty text={t.statement.noArguments} />}
      {list.map((arg) => (
        <StatementCard key={arg.address} statement={arg} showResult={false} />
      ))}
    </div>
  );
}

function Header({ statement }: { statement: Statement }) {
  const { t } = useI18n();
  const { votes, result } = statement;

  return (
    <div className="rounded-2xl bg-card p-4">
      {statement.depth > 0 && (
        <span
          className={cn(
            'text-xs font-medium uppercase',
            statement.side === 'pro' ? 'text-pro' : 'text-con',
          )}
        >
          {statement.side === 'pro' ? t.statement.pro : t.statement.con}
        </span>
      )}
      <h1 className="text-lg leading-snug font-semibold break-words">
        {statement.text}
      </h1>

      {statement.url && (
        <a
          href={statement.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate text-sm text-link"
        >
          {t.statement.source}: {statement.url}
        </a>
      )}

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-hint">
        <span>{formatTon(votes.amount)} TON</span>
        <span>{t.votes.voters(votes.voters)}</span>
        <span>
          {t.statement.author}: {shortAddress(statement.author)}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <ResultBar pro={result.pro_weight} con={result.con_weight} />
        <div className="flex justify-between text-xs">
          <span className="text-pro">
            {t.statement.pro} {formatTon(result.pro_amount)} TON
          </span>
          <span className="text-con">
            {t.statement.con} {formatTon(result.con_amount)} TON
          </span>
        </div>
      </div>
    </div>
  );
}
