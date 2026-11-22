import './polyfills';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';
import App from './App';
import { detectLang } from './i18n';
import { AppProviders } from './providers/AppProviders';
import { navigate } from './router';
import { initTelegram } from './telegram';

const launch = initTelegram();

// t.me/<bot>/<app>?startapp=<address> opens a statement directly
if (launch.startParam && !window.location.hash) {
  navigate({ name: 'statement', address: launch.startParam });
}

const lang = detectLang(launch.languageCode);
document.documentElement.lang = lang;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders lang={lang}>
      <App inTelegram={launch.inTelegram} />
    </AppProviders>
  </StrictMode>,
);
