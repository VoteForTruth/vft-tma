import { useState } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';

import { ApiError, useStatement, type Statement, type UrlChange } from '@/api';
import {
  CreateSheet,
  DeleteSheet,
  DonateSheet,
  UrlSheet,
  VoteSheet,
} from '@/components/ActionSheets';
import { PendingList } from '@/components/Pending';
import { ResultBar } from '@/components/ResultBar';
import { StatementCard } from '@/components/StatementCard';
import { Empty, LoadError, Loading } from '@/components/State';
import {
  CURRENCY,
  formatDate,
  formatGrams,
  sameAddress,
  shortAddress,
} from '@/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { navigate } from '@/router';
import { shareStatement } from '@/share';
import { useToast } from '@/components/Toast';

type OpenSheet =
  | { kind: 'vote' }
  | { kind: 'donate' }
  | { kind: 'argument'; pro: boolean }
  | { kind: 'delete' }
  | { kind: 'url' }
  | null;

export function StatementScreen({ address }: { address: string }) {
  const { t } = useI18n();
  const query = useStatement(address);
  const [side, setSide] = useState<'pro' | 'con'>('pro');
  const [sheet, setSheet] = useState<OpenSheet>(null);

  if (query.isPending) return <Loading />;
  if (query.isError) {
    const status = query.error instanceof ApiError ? query.error.status : 0;
    if (status === 404) return <Empty text={t.statement.notFound} />;
    if (status === 410) {
      const body = (query.error as ApiError).body as { deleted?: boolean };
      return (
        <Empty
          text={body?.deleted ? t.statement.deleted : t.statement.hidden}
        />
      );
    }
    return <LoadError onRetry={() => query.refetch()} />;
  }

  // url_history may be missing on an older indexer
  const { statement, pro, con, url_history = [] } = query.data;
  const list = side === 'pro' ? pro : con;

  return (
    <div className="space-y-3">
      <Header
        statement={statement}
        onVote={() => setSheet({ kind: 'vote' })}
        onDonate={() => setSheet({ kind: 'donate' })}
        onDelete={() => setSheet({ kind: 'delete' })}
        onEditUrl={() => setSheet({ kind: 'url' })}
        urlHistory={url_history}
      />

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

      <button
        type="button"
        onClick={() => setSheet({ kind: 'argument', pro: side === 'pro' })}
        className={cn(
          'w-full rounded-2xl bg-card py-3 text-sm font-medium',
          side === 'pro' ? 'text-pro' : 'text-con',
        )}
      >
        {side === 'pro' ? t.actions.addPro : t.actions.addCon}
      </button>

      <PendingList parent={statement.address} pro={side === 'pro'} />
      {list.length === 0 && <Empty text={t.statement.noArguments} />}
      {list.map((arg) => (
        <StatementCard key={arg.address} statement={arg} showResult={false} />
      ))}

      {sheet?.kind === 'vote' && (
        <VoteSheet
          statement={statement.address}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'donate' && (
        <DonateSheet
          statement={statement.address}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'url' && (
        <UrlSheet
          statement={statement.address}
          current={statement.url}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.kind === 'delete' && (
        <DeleteSheet
          statement={statement.address}
          onClose={() => setSheet(null)}
          onDeleted={() =>
            navigate(
              statement.depth > 0
                ? { name: 'statement', address: statement.parent }
                : { name: 'feed' },
            )
          }
        />
      )}
      {sheet?.kind === 'argument' && (
        <CreateSheet
          parent={statement.address}
          pro={sheet.pro}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

function Header({
  statement,
  onVote,
  onDonate,
  onDelete,
  onEditUrl,
  urlHistory,
}: {
  statement: Statement;
  onVote: () => void;
  onDonate: () => void;
  onDelete: () => void;
  onEditUrl: () => void;
  urlHistory: UrlChange[];
}) {
  const { t, lang } = useI18n();
  const [showHistory, setShowHistory] = useState(false);
  const toast = useToast();
  const wallet = useTonAddress();
  // only the author, and only while nobody has answered (the contract checks it too)
  const isAuthor = !!wallet && sameAddress(statement.author, wallet);
  const canDelete = isAuthor && statement.deletable;
  const lastChange = urlHistory[urlHistory.length - 1];
  const { votes, result } = statement;

  const share = async () => {
    if (await shareStatement(statement.address, statement.text))
      toast(t.actions.copied);
  };

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

      {statement.url_changed && lastChange && (
        <div className="mt-1 text-xs text-hint">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="underline decoration-dotted underline-offset-2"
          >
            {t.link.changed} {formatDate(lastChange.time, lang)}
          </button>
          {showHistory && (
            <ol className="mt-1 space-y-0.5">
              {urlHistory.map((h) => (
                <li key={h.time} className="break-all">
                  {formatDate(h.time, lang)} —{' '}
                  {h.url ? (
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      {h.url}
                    </a>
                  ) : (
                    t.link.none
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-hint">
        <span>
          {formatGrams(votes.amount)} {CURRENCY}
        </span>
        <span>{t.votes.voters(votes.voters)}</span>
        <span>
          {t.statement.author}: {shortAddress(statement.author)}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <ResultBar pro={result.pro_weight} con={result.con_weight} />
        <div className="flex justify-between text-xs">
          <span className="text-pro">
            {t.statement.pro} {formatGrams(result.pro_amount)} {CURRENCY}
          </span>
          <span className="text-con">
            {t.statement.con} {formatGrams(result.con_amount)} {CURRENCY}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-medium">
        <button
          type="button"
          onClick={onVote}
          className="rounded-xl bg-primary py-2.5 text-primary-foreground"
        >
          {t.actions.support}
        </button>
        <button
          type="button"
          onClick={onDonate}
          className="rounded-xl bg-secondary py-2.5 text-link"
        >
          {t.actions.donate}
        </button>
        <button
          type="button"
          onClick={share}
          className="rounded-xl bg-secondary py-2.5 text-link"
        >
          {t.actions.share}
        </button>
      </div>

      {isAuthor && (
        <div className="mt-2 flex gap-2 text-sm">
          <button
            type="button"
            onClick={onEditUrl}
            className="flex-1 py-1.5 text-link"
          >
            {t.link.edit}
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 py-1.5 text-destructive"
            >
              {t.remove.action}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
