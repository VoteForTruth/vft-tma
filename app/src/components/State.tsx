import { useI18n } from '@/i18n';

export function Loading() {
  const { t } = useI18n();
  return <p className="py-10 text-center text-hint">{t.common.loading}</p>;
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="py-10 text-center">
      <p className="text-hint">{t.common.error}</p>
      <button type="button" onClick={onRetry} className="mt-3 text-link">
        {t.common.retry}
      </button>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="py-10 text-center text-hint">{text}</p>;
}
