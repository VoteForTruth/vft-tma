import { isTMA, shareURL } from '@tma.js/sdk-react';

import { config } from './config';

// A link that opens the statement: inside Telegram through the Mini App
// (t.me/<bot>/<app>?startapp=<address>), otherwise the web version.
export function statementLink(address: string): string {
  if (config.appLink) return `${config.appLink}?startapp=${address}`;
  return `${window.location.origin}${window.location.pathname}#/s/${address}`;
}

// Opens the Telegram share dialog, or copies the link in a regular browser.
// Returns true if the link was copied.
export async function shareStatement(
  address: string,
  text: string,
): Promise<boolean> {
  const link = statementLink(address);
  if (isTMA() && shareURL.isAvailable()) {
    shareURL(link, text);
    return false;
  }
  await navigator.clipboard.writeText(link);
  return true;
}
