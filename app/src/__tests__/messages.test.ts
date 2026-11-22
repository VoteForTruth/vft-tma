import { Address, beginCell } from '@ton/core';
import { describe, expect, it } from 'vitest';

import { VftMaster } from '@wrappers/VftMaster.gen';
import { VftStatement } from '@wrappers/VftStatement.gen';
import { VftVote } from '@wrappers/VftVote.gen';

// Real testnet contracts of the scenario used across the project.
const wallet = Address.parse(
  '0QDYVkbXA-Iix_5RcZpa2RSFRnU_U5ik1GA9pP-RpytyST7z',
);
const master = Address.parse(
  'kQAtLOtQSvcqzpgpgmRoymv4BN5w5lcgF1VN6Ob0F4J0STiU',
);
const root = Address.parse('kQC-MCQhctLfNy4pUxT6kpeugXtaO3ONJ-XazF-ptjHfuEQ5');
const vote = Address.parse('EQDFq5TVdTtciR7pHb6WHe7dfQkZz2dIZf43FOHhurAzlTdB');

describe('addresses derived in the app', () => {
  it('match the deployed master and vote', () => {
    // revokes are sent to this address, so it must be exactly the on-chain one
    expect(
      VftVote.fromStorage({
        statement: root,
        owner: wallet,
        amount: 0n,
      }).address.equals(vote),
    ).toBe(true);
    expect(
      VftMaster.fromStorage({
        owner: wallet,
        statementsCount: 0n,
      }).address.equals(master),
    ).toBe(true);
  });
});

describe('message bodies', () => {
  it('encodes a vote', () => {
    const s = VftStatement.createCellOfVote({
      amount: 500_000_000n,
    }).beginParse();
    expect(s.loadUint(32)).toBe(0x56f40005);
    expect(s.loadCoins()).toBe(500_000_000n);
  });

  it('encodes a new argument with an optional url', () => {
    const data = { $: 'VftData' as const, statement: 'Аргумент за', url: null };
    const s = VftStatement.createCellOfNewChildStatement({
      data,
      pro: true,
    }).beginParse();
    expect(s.loadUint(32)).toBe(0x56f40002);
    expect(s.loadStringRefTail()).toBe('Аргумент за');
    expect(s.loadBit()).toBe(false); // no url
    expect(s.loadBit()).toBe(true); // pro
  });

  it('encodes revokes', () => {
    const part = VftVote.createCellOfWithdraw({
      amount: 300_000_000n,
    }).beginParse();
    expect(part.loadUint(32)).toBe(0x56f40007);
    expect(part.loadCoins()).toBe(300_000_000n);
    expect(VftVote.createCellOfWithdrawAll({}).beginParse().loadUint(32)).toBe(
      0x56f40008,
    );
  });

  it('encodes the donate comment like a wallet does', () => {
    const body = beginCell()
      .storeUint(0, 32)
      .storeStringTail('donate')
      .endCell()
      .beginParse();
    expect(body.loadUint(32)).toBe(0);
    expect(body.loadStringTail()).toBe('donate');
  });
});
