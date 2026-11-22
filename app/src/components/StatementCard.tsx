import type { Statement } from '@/api';
import { formatTon } from '@/format';
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();
  const { votes, arguments: args, result } = statement;
  const concentrated = votes.voters > 3 && votes.top3_share >= 0.8;

  return (
    <button
      type="button"
      onClick={() =>
        navigate({ name: 'statement', address: statement.address })
      }
      className="w-full rounded-2xl bg-card p-4 text-left active:opacity-70"
    >
      <p className="text-[15px] leading-snug break-words">{statement.text}</p>

      {showResult && args.pro + args.con > 0 && (
        <div className="mt-3">
          <ResultBar pro={result.pro_weight} con={result.con_weight} />
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-hint">
        <span>{formatTon(votes.amount)} TON</span>
        <span>{t.votes.voters(votes.voters)}</span>
        {args.pro + args.con > 0 && (
          <span>{t.votes.arguments(args.pro + args.con)}</span>
        )}
        {concentrated && (
          <span className="text-con">
            {t.votes.concentration(votes.top3_share, 3)}
          </span>
        )}
      </div>
    </button>
  );
}
