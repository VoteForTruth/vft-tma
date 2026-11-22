import {
  backButton,
  init,
  isTMA,
  miniApp,
  retrieveLaunchParams,
  themeParams,
} from '@tma.js/sdk-react';

export interface LaunchContext {
  inTelegram: boolean;
  // Telegram user's language, e.g. "ru"
  languageCode?: string;
  // the `startapp` parameter of a t.me link: an address of a statement to open
  startParam?: string;
}

// The brand background (styles.css --bg): Telegram's header and background are
// painted with it, so there is no strip of the user's theme around the app.
const BRAND_BG = '#07060d';

// Initializes the Telegram Mini App SDK when running inside Telegram.
// In a regular browser (development) it does nothing.
export function initTelegram(): LaunchContext {
  if (!isTMA()) {
    return { inTelegram: false };
  }

  init();
  // the app has its own dark theme; Telegram theme colors are not bound
  themeParams.mount();
  miniApp.mount();
  for (const paint of [
    () => miniApp.setHeaderColor(BRAND_BG),
    () => miniApp.setBgColor(BRAND_BG),
    () => miniApp.setBottomBarColor(BRAND_BG),
  ]) {
    try {
      paint();
    } catch {
      // older Telegram clients lack some of these methods
    }
  }
  backButton.mount();
  miniApp.ready();

  const lp = retrieveLaunchParams();
  return {
    inTelegram: true,
    languageCode: lp.tgWebAppData?.user?.language_code,
    startParam: lp.tgWebAppStartParam,
  };
}
