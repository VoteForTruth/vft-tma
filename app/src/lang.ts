// The language of a statement's text: ISO 639-1, two lowercase letters. The
// contract requires it; the app guesses it while the author types (the author
// can change it). Short texts are guessed by script and a few distinctive
// letters — good enough to suggest, not to decide without the author.

export const LANGS = [
  'ru',
  'en',
  'uk',
  'be',
  'kk',
  'de',
  'fr',
  'es',
  'it',
  'pt',
  'pl',
  'tr',
  'ar',
  'he',
  'fa',
  'hi',
  'zh',
  'ja',
  'ko',
  'ka',
  'hy',
  'el',
] as const;

const scripts: [RegExp, string][] = [
  [/[֐-׿]/g, 'he'],
  [/[؀-ۿ]/g, 'ar'],
  [/[ऀ-ॿ]/g, 'hi'],
  [/[぀-ヿ]/g, 'ja'],
  [/[가-힯]/g, 'ko'],
  [/[一-鿿]/g, 'zh'],
  [/[Ⴀ-ჿ]/g, 'ka'],
  [/[԰-֏]/g, 'hy'],
  [/[Ͱ-Ͽ]/g, 'el'],
  [/[Ѐ-ӿ]/g, 'cyrillic'],
  [/[a-zA-ZÀ-ɏ]/g, 'latin'],
];

function count(text: string, re: RegExp) {
  return text.match(re)?.length ?? 0;
}

// Guesses the language of `text`; `fallback` (the interface language) is used
// for an empty text or a script without a clear language.
export function detectLang(text: string, fallback: string): string {
  let best = '';
  let bestCount = 0;
  for (const [re, name] of scripts) {
    const n = count(text, re);
    if (n > bestCount) {
      best = name;
      bestCount = n;
    }
  }
  if (bestCount === 0) return fallback;

  if (best === 'cyrillic') {
    if (/[ўЎ]/.test(text)) return 'be';
    if (/[әғқңөұүһӘҒҚҢӨҰҮҺ]/.test(text)) return 'kk';
    if (/[іїєґІЇЄҐ]/.test(text)) return 'uk';
    return 'ru';
  }
  if (best === 'latin') {
    if (/[ąćęłńśźżĄĆĘŁŃŚŹŻ]/.test(text)) return 'pl';
    if (/[ğışĞİŞ]/.test(text)) return 'tr';
    if (/[äöüßÄÖÜ]/.test(text)) return 'de';
    if (/[ñ¿¡Ñ]/.test(text)) return 'es';
    if (/[ãõÃÕ]/.test(text)) return 'pt';
    if (/[çœàâêîôûëÇŒÀÂÊÎÔÛË]/.test(text)) return 'fr';
    return 'en';
  }
  return best;
}

// The language's own name, e.g. "русский", "English".
export function langName(code: string, inLang: string): string {
  try {
    const name = new Intl.DisplayNames([inLang], { type: 'language' }).of(code);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
  } catch {
    return code;
  }
}

// The contract stores the code as uint16: two ASCII letters, "ru" = 0x7275.
export function langToUint16(code: string): bigint {
  if (!/^[a-z]{2}$/.test(code))
    throw new Error(`invalid language code: ${code}`);
  return BigInt((code.charCodeAt(0) << 8) | code.charCodeAt(1));
}
