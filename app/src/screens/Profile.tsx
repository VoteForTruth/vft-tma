import { useTonAddress } from '@tonconnect/ui-react';
import { useState, type ReactNode } from 'react';

import { useWalletStatements, useWalletVotes, type WalletVote } from '@/api';
import { StatementCard } from '@/components/StatementCard';
import { Empty, Loading } from '@/components/State';
import { CURRENCY, formatGrams } from '@/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { navigate } from '@/router';
import { useToast } from '@/components/Toast';
import { useVftActions } from '@/tx';

export function Profile() {
  const { t } = useI18n();
  const wallet = useTonAddress();
  const votes = useWalletVotes(wallet || null);
  const statements = useWalletStatements(wallet || null);

  if (!wallet) return <Empty text={t.profile.connect} />;

  const donated = (statements.data?.statements ?? []).reduce(
    (sum, s) => sum + BigInt(s.donations),
    0n,
  );

  return (
    <div className="space-y-5">
      <Section title={t.profile.myVotes}>
        {votes.isPending && <Loading />}
        {votes.data?.votes.length === 0 && <Empty text={t.profile.nothing} />}
        {votes.data?.votes.map((v) =>
          v.deleted ? (
            <DeletedVote key={v.statement} vote={v} />
          ) : (
            <button
              key={v.statement}
              type="button"
              onClick={() =>
                navigate({ name: 'statement', address: v.statement })
              }
              className="w-full rounded-2xl bg-card p-4 text-left active:opacity-70"
            >
              {v.depth > 0 && (
                <span
                  className={cn(
                    'text-xs font-medium uppercase',
                    v.side === 'pro' ? 'text-pro' : 'text-con',
                  )}
                >
                  {v.side === 'pro' ? t.statement.pro : t.statement.con}
                </span>
              )}
              <p className="text-[15px] break-words">{v.text}</p>
              <p className="mt-1 text-[13px] text-hint">
                {formatGrams(v.amount)} {CURRENCY} · {t.profile.weight}{' '}
                {formatGrams(v.weight)}
              </p>
            </button>
          ),
        )}
      </Section>

      <Section title={t.profile.myStatements}>
        {statements.isPending && <Loading />}
        {statements.data?.statements.length === 0 && (
          <Empty text={t.profile.nothing} />
        )}
        {statements.data?.statements.map((s) => (
          <div key={s.address}>
            {s.hidden && (
              <p className="mb-1 px-1 text-xs text-destructive">
                {t.statement.hidden}
                {s.hidden.reason ? `: ${s.hidden.reason}` : ''}
              </p>
            )}
            <StatementCard statement={s} showResult={s.depth === 0} />
          </div>
        ))}
      </Section>

      {donated > 0n && (
        <Section title={t.profile.donations}>
          <div className="rounded-2xl bg-card p-4 text-[15px]">
            {formatGrams(donated)} {CURRENCY}
          </div>
        </Section>
      )}
    </div>
  );
}

// A vote on a statement its author deleted: there is nothing to open, only the
// money to take back.
function DeletedVote({ vote }: { vote: WalletVote }) {
  const { t } = useI18n();
  const actions = useVftActions();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const withdraw = async () => {
    setBusy(true);
    try {
      if ((await actions.revoke(vote.statement, 'all')) === 'sent')
        toast(t.actions.sent);
    } catch (err) {
      console.error(err);
      toast(t.actions.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-hint">{t.remove.deletedVote}</p>
        <p className="mt-1 text-[13px] text-hint">
          {formatGrams(vote.amount)} {CURRENCY}
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={withdraw}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {t.remove.withdraw}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-medium text-hint uppercase">{title}</h2>
      {children}
    </section>
  );
}
