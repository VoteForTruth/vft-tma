import { useEffect, type PropsWithChildren } from 'react';

import { useI18n } from '@/i18n';

// A bottom sheet: the usual pattern for actions in mobile and Telegram apps.
export function Sheet({
  title,
  onClose,
  children,
}: PropsWithChildren<{ title: string; onClose: () => void }>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl rounded-t-2xl bg-card p-4 pb-8">
        <h2 className="mb-3 text-[17px] font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// While `busy`, the wallet is waiting for the user's confirmation.
export function PrimaryButton({
  disabled,
  busy,
  onClick,
  children,
}: PropsWithChildren<{
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
}>) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground disabled:opacity-40"
    >
      {busy ? t.actions.confirmInWallet : children}
    </button>
  );
}

export const inputClass =
  'w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-[15px] outline-none focus:border-primary';
