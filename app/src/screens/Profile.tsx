import { useTonAddress } from '@tonconnect/ui-react';

import { Empty } from '@/components/State';
import { useI18n } from '@/i18n';

// Filled in later: my votes, my statements, donations.
export function Profile() {
  const { t } = useI18n();
  const wallet = useTonAddress();
  if (!wallet) return <Empty text={t.profile.connect} />;
  return <Empty text={t.profile.title} />;
}
