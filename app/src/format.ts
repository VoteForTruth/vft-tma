import { Address } from '@ton/core';

const NANO = 1_000_000_000n;

// The coin of the TON blockchain is called GRAM. Amounts on-chain and in the
// API are in nano-units (1 GRAM = 10^9), historically called nanotons.
export const CURRENCY = 'GRAM';

// Formats nano-units with up to `digits` decimals: "1.25", "0.3", "12".
export function formatGrams(nano: string | bigint, digits = 2): string {
  const value = typeof nano === 'bigint' ? nano : BigInt(nano);
  const whole = value / NANO;
  const frac = value % NANO;
  if (frac === 0n || digits === 0) return whole.toString();

  const fracText = frac
    .toString()
    .padStart(9, '0')
    .slice(0, digits)
    .replace(/0+$/, '');
  if (fracText === '') {
    // a tiny amount that rounds to zero must not look like nothing
    return whole === 0n ? `<0.${'0'.repeat(digits - 1)}1` : whole.toString();
  }
  return `${whole}.${fracText}`;
}

// Parses "1.5" or "1,5" GRAM into nano-units; null if invalid.
export function parseGrams(text: string): bigint | null {
  const match = text
    .trim()
    .replace(',', '.')
    .match(/^(\d+)(?:\.(\d{0,9}))?$/);
  if (!match) return null;
  return BigInt(match[1]) * NANO + BigInt((match[2] ?? '').padEnd(9, '0'));
}

// Share of `part` in `part + other`, 0..1; 0.5 when both are zero.
export function ratio(part: string, other: string): number {
  const a = Number(BigInt(part));
  const b = Number(BigInt(other));
  return a + b === 0 ? 0.5 : a / (a + b);
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

// UTF-8 size of a text: the contract limits statements in bytes, not characters.
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

// The same address can be written in several forms (raw, bounceable, testnet...).
export function sameAddress(a: string, b: string): boolean {
  try {
    return Address.parse(a).equals(Address.parse(b));
  } catch {
    return false;
  }
}
