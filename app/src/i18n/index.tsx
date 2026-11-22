import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { ru } from './ru';
import { en } from './en';

// Russian is the source of truth for keys; English must provide the same shape.
export type Messages = typeof ru;
export type Lang = 'ru' | 'en';

const dictionaries: Record<Lang, Messages> = { ru, en };
const STORAGE_KEY = 'vft:lang';

// Telegram user language first, then the browser; Russian-speaking users get Russian.
export function detectLang(telegramLang?: string): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {
    // storage may be unavailable, fall through to detection
  }
  const source = telegramLang ?? navigator.language;
  return source.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

interface I18n {
  lang: Lang;
  t: Messages;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  initial,
  children,
}: PropsWithChildren<{ initial: Lang }>) {
  const [lang, setLangState] = useState<Lang>(initial);

  const value = useMemo<I18n>(
    () => ({
      lang,
      t: dictionaries[lang],
      setLang: (next) => {
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // not critical: the choice just won't be remembered
        }
      },
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n outside I18nProvider');
  return ctx;
}
