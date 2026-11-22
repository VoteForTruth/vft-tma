import type { Statement } from '@/api';
import { CURRENCY, formatGrams } from '@/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { useDeleting } from '@/pending';
import { navigate } from '@/router';
import { ResultBar } from './ResultBar';

// A compact statement: used in the feed and in the argument lists.
export function StatementCard({
  statement,
  showResult,
}: {
  statement: Statement;
  showResult: boolean;
}) {
  const { t, lang } = useI18n();
  const { votes, arguments: args, result } = statement;
  const concentrated = votes.voters > 3 && votes.top3_share >= 0.8;
  const deleting = useDeleting().has(statement.address);

  return (
    <button
      type="button"
      onClick={() =>
        navigate({ name: 'statement', address: statement.address })
      }
      className={cn(
        'w-full rounded-2xl bg-card p-4 text-left active:opacity-70',
        deleting && 'opacity-40',
      )}
    >
      {deleting && (
        <p className="mb-1 text-xs text-destructive">{t.pending.deleting}</p>
      )}
      <p className="text-[15px] leading-snug break-words">
        {statement.lang && statement.lang !== lang && (
          <span className="mr-1.5 rounded bg-secondary px-1 py-0.5 align-middle text-[11px] text-hint uppercase">
            {statement.lang}
          </span>
        )}
        {statement.text}
      </p>

      {showResult && args.pro + args.con > 0 && (
        <div className="mt-3">
          <ResultBar pro={result.pro_weight} con={result.con_weight} />
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-hint">
        <span>
          {formatGrams(votes.amount)} {CURRENCY}
        </span>
        <span>{t.votes.voters(votes.voters)}</span>
        {args.pro + args.con > 0 && (
          <span>{t.votes.arguments(args.pro + args.con)}</span>
        )}
        {concentrated && (
          <span className="text-warn">
            ⚠ {t.votes.concentration(votes.top3_share, 3)}
          </span>
        )}
      </div>
    </button>
  );
}
