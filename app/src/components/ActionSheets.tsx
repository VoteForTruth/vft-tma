import { useState } from 'react';

import { useWalletVotes } from '@/api';
import {
  CURRENCY,
  byteLength,
  formatGrams,
  parseGrams,
  sameAddress,
} from '@/format';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  MAX_STATEMENT_BYTES,
  MAX_URL_BYTES,
  useVftActions,
  type TxResult,
} from '@/tx';
import { useTonAddress } from '@tonconnect/ui-react';
import { addPendingStatement, markDeleting } from '@/pending';
import { inputClass, PrimaryButton, Sheet } from './Sheet';
import { useToast } from './Toast';

// Runs a transaction, reports the result and closes the sheet once it is sent.
function useSubmit(onClose: () => void) {
  const { t } = useI18n();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const submit = async (action: () => Promise<TxResult>) => {
    setBusy(true);
    try {
      if ((await action()) === 'sent') {
        toast(t.actions.sent);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast(t.actions.failed);
    } finally {
      setBusy(false);
    }
  };
  return { busy, submit };
}

function AmountInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useI18n();
  return (
    <input
      className={inputClass}
      inputMode="decimal"
      placeholder={t.vote.amount}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function VoteSheet({
  statement,
  onClose,
}: {
  statement: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const actions = useVftActions();
  const wallet = useTonAddress();
  const votes = useWalletVotes(wallet || null);
  const { busy, submit } = useSubmit(onClose);
  const [mode, setMode] = useState<'add' | 'revoke'>('add');
  const [amountText, setAmountText] = useState('');

  const current = votes.data?.votes.find((v) =>
    sameAddress(v.statement, statement),
  );
  const amount = parseGrams(amountText);
  const valid =
    amount !== null &&
    amount > 0n &&
    (mode === 'add' || !current || amount <= BigInt(current.amount));

  return (
    <Sheet title={t.vote.title} onClose={onClose}>
      {current && (
        <div className="mb-3 rounded-xl bg-secondary p-3 text-sm">
          {t.vote.current}:{' '}
          <b>
            {formatGrams(current.amount)} {CURRENCY}
          </b>{' '}
          <span className="text-hint">
            ({t.profile.weight} {formatGrams(current.weight)})
          </span>
        </div>
      )}

      {current && (
        <div className="mb-3 flex gap-1 rounded-xl bg-secondary p-1">
          {(['add', 'revoke'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-sm',
                mode === m ? 'bg-card' : 'text-hint',
              )}
            >
              {m === 'add' ? t.vote.add : t.vote.revoke}
            </button>
          ))}
        </div>
      )}

      <AmountInput value={amountText} onChange={setAmountText} />
      {amountText && amount === null && (
        <p className="mt-1 text-sm text-destructive">
          {t.actions.invalidAmount}
        </p>
      )}
      <p className="mt-2 text-[13px] text-hint">
        {mode === 'add' ? `${t.vote.hint} ${t.vote.gas}` : ''}
      </p>

      <div className="mt-4 space-y-2">
        <PrimaryButton
          disabled={!valid || busy}
          onClick={() =>
            submit(() =>
              mode === 'add'
                ? actions.vote(statement, amount!)
                : actions.revoke(statement, amount!),
            )
          }
        >
          {mode === 'add' ? t.vote.send : t.vote.revoke}
        </PrimaryButton>
        {mode === 'revoke' && current && (
          <button
            type="button"
            disabled={busy}
            onClick={() => submit(() => actions.revoke(statement, 'all'))}
            className="w-full py-2 text-destructive"
          >
            {t.vote.revokeAll}
          </button>
        )}
      </div>
    </Sheet>
  );
}

// Creates a root statement (parent = null) or a pro/con argument.
export function CreateSheet({
  parent,
  pro,
  onClose,
}: {
  parent: string | null;
  pro: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const actions = useVftActions();
  const { busy, submit } = useSubmit(onClose);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const textBytes = byteLength(text.trim());
  const urlBytes = byteLength(url.trim());
  const valid =
    textBytes > 0 &&
    textBytes <= MAX_STATEMENT_BYTES &&
    urlBytes <= MAX_URL_BYTES;
  const title =
    parent === null ? t.create.root : pro ? t.create.pro : t.create.con;

  const publish = () => {
    const data = { statement: text.trim(), url: url.trim() || null };
    return parent === null
      ? actions.createRoot(data)
      : actions.createArgument(parent, pro, data);
  };

  // until the indexer shows it, the list shows a "publishing" card
  const publishAndTrack = async () => {
    const result = await publish();
    if (result === 'sent') addPendingStatement(parent, pro, text.trim());
    return result;
  };

  return (
    <Sheet title={title} onClose={onClose}>
      <textarea
        className={cn(inputClass, 'min-h-28 resize-none')}
        placeholder={t.create.text}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <p
        className={cn(
          'mt-1 text-right text-xs',
          textBytes > MAX_STATEMENT_BYTES ? 'text-destructive' : 'text-hint',
        )}
      >
        {textBytes > MAX_STATEMENT_BYTES ? `${t.create.tooLong} · ` : ''}
        {t.create.bytes(textBytes, MAX_STATEMENT_BYTES)}
      </p>

      <input
        className={cn(inputClass, 'mt-2')}
        placeholder={t.create.url}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {urlBytes > MAX_URL_BYTES && (
        <p className="mt-1 text-xs text-destructive">{t.create.urlTooLong}</p>
      )}
      <p className="mt-1 text-xs text-hint">{t.create.archiveTip}</p>

      <p className="mt-3 text-[13px] text-hint">{t.create.cost}</p>
      <p className="mt-2 rounded-xl bg-secondary p-3 text-[13px]">
        ⚠ {t.create.warning}
      </p>
      <div className="mt-4">
        <PrimaryButton
          disabled={!valid || busy}
          onClick={() => submit(publishAndTrack)}
        >
          {t.create.publish}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

// The author replaces the source link of a statement; the text never changes.
export function UrlSheet({
  statement,
  current,
  onClose,
}: {
  statement: string;
  current: string | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const actions = useVftActions();
  const { busy, submit } = useSubmit(onClose);
  const [url, setUrl] = useState(current ?? '');

  const value = url.trim();
  const bytes = byteLength(value);
  const wellFormed = value === '' || /^https?:\/\/\S+$/i.test(value);
  const valid =
    wellFormed && bytes <= MAX_URL_BYTES && value !== (current ?? '');

  return (
    <Sheet title={t.link.title} onClose={onClose}>
      <p className="mb-3 text-sm">{t.link.hint}</p>
      <input
        className={inputClass}
        inputMode="url"
        placeholder={t.link.placeholder}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      {!wellFormed && (
        <p className="mt-1 text-xs text-destructive">{t.link.invalid}</p>
      )}
      {bytes > MAX_URL_BYTES && (
        <p className="mt-1 text-xs text-destructive">{t.create.urlTooLong}</p>
      )}
      <p className="mt-1 text-xs text-hint">{t.create.archiveTip}</p>
      <p className="mt-3 rounded-xl bg-secondary p-3 text-[13px]">
        ⚠ {t.link.public}
      </p>
      <div className="mt-4">
        <PrimaryButton
          disabled={!valid || busy}
          onClick={() =>
            submit(() => actions.setUrl(statement, value === '' ? null : value))
          }
        >
          {value === '' ? t.link.removeLink : t.link.save}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

// The author deletes a statement nobody has answered yet.
export function DeleteSheet({
  statement,
  onClose,
  onDeleted,
}: {
  statement: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useI18n();
  const actions = useVftActions();
  const { busy, submit } = useSubmit(onClose);

  const remove = async () => {
    const result = await actions.deleteStatement(statement);
    if (result === 'sent') {
      markDeleting(statement);
      onDeleted();
    }
    return result;
  };

  return (
    <Sheet title={t.remove.title} onClose={onClose}>
      <p className="text-sm">{t.remove.hint}</p>
      <p className="mt-2 rounded-xl bg-secondary p-3 text-[13px]">
        ⚠ {t.remove.history}
      </p>
      <div className="mt-4 space-y-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => submit(remove)}
          className="w-full rounded-xl bg-destructive py-3 font-medium text-white disabled:opacity-50"
        >
          {t.remove.confirm}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-hint"
        >
          {t.actions.cancel}
        </button>
      </div>
    </Sheet>
  );
}

export function DonateSheet({
  statement,
  onClose,
}: {
  statement: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const actions = useVftActions();
  const { busy, submit } = useSubmit(onClose);
  const [amountText, setAmountText] = useState('');
  const amount = parseGrams(amountText);

  return (
    <Sheet title={t.donate.title} onClose={onClose}>
      <AmountInput value={amountText} onChange={setAmountText} />
      {amountText && amount === null && (
        <p className="mt-1 text-sm text-destructive">
          {t.actions.invalidAmount}
        </p>
      )}
      <p className="mt-2 text-[13px] text-hint">{t.donate.hint}</p>
      <div className="mt-4">
        <PrimaryButton
          disabled={amount === null || amount <= 0n || busy}
          onClick={() => submit(() => actions.donate(statement, amount!))}
        >
          {t.donate.send}
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
