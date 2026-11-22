import { useEffect, useState } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';

import { useWalletStatements } from '@/api';
import { sameAddress } from '@/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  dismissPendingStatement,
  PENDING_TIMEOUT_MS,
  resolvePendingStatements,
  usePendingStatements,
  type PendingStatement,
} from '@/pending';

// Removes "publishing" cards once the indexer returns the statements: the
// author's own list has all of them, whatever tab or sort is open.
export function PendingResolver() {
  const wallet = useTonAddress();
  const mine = useWalletStatements(wallet || null);
  const pending = usePendingStatements(undefined);

  useEffect(() => {
    if (!mine.data) return;
    for (const p of pending) {
      const found = mine.data.statements.some(
        (s) =>
          s.text === p.text &&
          (p.parent === null ? s.depth === 0 : sameAddress(s.parent, p.parent)),
      );
      if (found) resolvePendingStatements(p.parent, [p.text]);
    }
  }, [mine.data, pending]);

  return null;
}

// Statements the user has just published under `parent` (null: the feed),
// optionally only one side.
export function PendingList({
  parent,
  pro,
}: {
  parent: string | null;
  pro?: boolean;
}) {
  const pending = usePendingStatements(parent).filter(
    (p) => pro === undefined || p.pro === pro,
  );
  return (
    <>
      {pending.map((p) => (
        <PendingCard key={p.id} item={p} />
      ))}
    </>
  );
}

function PendingCard({ item }: { item: PendingStatement }) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);
  const slow = now - item.sentAt > PENDING_TIMEOUT_MS;

  return (
    <div className="w-full rounded-2xl border border-dashed border-primary/50 bg-card p-4">
      <p className="text-[15px] leading-snug break-words opacity-70">
        {item.text}
      </p>
      <p
        className={cn(
          'mt-2 flex items-center gap-2 text-[13px]',
          slow ? 'text-warn' : 'text-hint',
        )}
      >
        {!slow && (
          <span className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        {slow ? t.pending.slow : t.pending.publishing}
      </p>
      {slow && (
        <button
          type="button"
          onClick={() => dismissPendingStatement(item.id)}
          className="mt-2 text-[13px] text-link"
        >
          {t.pending.dismiss}
        </button>
      )}
    </div>
  );
}
