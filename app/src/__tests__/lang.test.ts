import { describe, expect, it } from 'vitest';

import { detectLang, langToUint16 } from '@/lang';

describe('language of a statement', () => {
  it('is guessed from the text', () => {
    expect(detectLang('Должны ли мессенджеры давать доступ?', 'en')).toBe('ru');
    expect(detectLang('Чи повинні месенджери надавати доступ?', 'ru')).toBe(
      'uk',
    );
    expect(detectLang('Should messengers give access?', 'ru')).toBe('en');
    expect(detectLang('Sollen Messenger Zugriff gewähren?', 'ru')).toBe('de');
    expect(detectLang('TON — это хорошо', 'en')).toBe('ru'); // mostly Cyrillic
    expect(detectLang('数据', 'ru')).toBe('zh');
  });

  it('falls back to the interface language without letters', () => {
    expect(detectLang('', 'en')).toBe('en');
    expect(detectLang('2 + 2 = 4?', 'ru')).toBe('ru');
  });

  it('is encoded for the contract as two ASCII letters', () => {
    expect(langToUint16('ru')).toBe(0x7275n);
    expect(langToUint16('en')).toBe(0x656en);
    expect(() => langToUint16('RU')).toThrow();
    expect(() => langToUint16('rus')).toThrow();
  });
});
