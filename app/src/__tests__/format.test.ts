import { Address } from '@ton/core';
import { describe, expect, it } from 'vitest';

import {
  byteLength,
  formatGrams,
  parseGrams,
  ratio,
  sameAddress,
} from '../format';

describe('parseGrams', () => {
  it('parses amounts in GRAM', () => {
    expect(parseGrams('1')).toBe(1_000_000_000n);
    expect(parseGrams('0.3')).toBe(300_000_000n);
    expect(parseGrams('1,5')).toBe(1_500_000_000n);
    expect(parseGrams(' 2.000000001 ')).toBe(2_000_000_001n);
  });

  it('rejects invalid input', () => {
    for (const bad of ['', 'abc', '1.2.3', '-1', '1.0000000001', '.5']) {
      expect(parseGrams(bad)).toBeNull();
    }
  });
});

describe('formatGrams', () => {
  it('formats nanotons', () => {
    expect(formatGrams('0')).toBe('0');
    expect(formatGrams('300000000')).toBe('0.3');
    expect(formatGrams('1250000000')).toBe('1.25');
    expect(formatGrams('99766065')).toBe('0.09');
    expect(formatGrams(12_000_000_000n)).toBe('12');
  });

  it('does not show a tiny amount as zero', () => {
    expect(formatGrams('26785')).toBe('<0.01');
  });
});

describe('byteLength', () => {
  it('counts UTF-8 bytes like the contract does', () => {
    expect(byteLength('abc')).toBe(3);
    expect(byteLength('я')).toBe(2);
    expect(byteLength('я'.repeat(250))).toBe(500);
  });
});

describe('ratio and addresses', () => {
  it('computes the pro share', () => {
    expect(ratio('3', '1')).toBe(0.75);
    expect(ratio('0', '0')).toBe(0.5);
  });

  it('compares addresses in any form', () => {
    expect(
      sameAddress(
        'kQC-MCQhctLfNy4pUxT6kpeugXtaO3ONJ-XazF-ptjHfuEQ5',
        Address.parse(
          'kQC-MCQhctLfNy4pUxT6kpeugXtaO3ONJ-XazF-ptjHfuEQ5',
        ).toString({ testOnly: false }),
      ),
    ).toBe(true);
    expect(
      sameAddress(
        'kQC-MCQhctLfNy4pUxT6kpeugXtaO3ONJ-XazF-ptjHfuEQ5',
        'garbage',
      ),
    ).toBe(false);
  });
});
