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

// Initializes the Telegram Mini App SDK when running inside Telegram.
// In a regular browser (development) it does nothing and the app uses fallback colors.
export function initTelegram(): LaunchContext {
  if (!isTMA()) {
    return { inTelegram: false };
  }

  init();
  themeParams.mount();
  themeParams.bindCssVars();
  miniApp.mount();
  miniApp.bindCssVars();
  backButton.mount();
  miniApp.ready();

  const lp = retrieveLaunchParams();
  return {
    inTelegram: true,
    languageCode: lp.tgWebAppData?.user?.language_code,
    startParam: lp.tgWebAppStartParam,
  };
}
