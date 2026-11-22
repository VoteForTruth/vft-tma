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
  'kQBrGKeeNbqmG_YrRXjsWcZtwmScMCNuaEs43_HcTkN2Qq9k',
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

  it('encodes a new argument with an optional url and the language', () => {
    const data = {
      $: 'VftData' as const,
      statement: 'Аргумент за',
      url: null,
      lang: 0x7275n, // "ru"
    };
    const s = VftStatement.createCellOfNewChildStatement({
      data,
      pro: true,
    }).beginParse();
    expect(s.loadUint(32)).toBe(0x56f40002);
    expect(s.loadStringRefTail()).toBe('Аргумент за');
    expect(s.loadBit()).toBe(false); // no url
    expect(s.loadUint(16)).toBe(0x7275); // lang
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

  it('encodes a link change and a link removal', () => {
    const set = VftStatement.createCellOfSetUrl({
      url: 'https://mirror.example',
    }).beginParse();
    expect(set.loadUint(32)).toBe(0x56f4000a);
    expect(set.loadMaybeRef()!.beginParse().loadStringTail()).toBe(
      'https://mirror.example',
    );
    const removed = VftStatement.createCellOfSetUrl({ url: null }).beginParse();
    expect(removed.loadUint(32)).toBe(0x56f4000a);
    expect(removed.loadBit()).toBe(false);
  });

  it('encodes a deletion', () => {
    const s = VftStatement.createCellOfDeleteStatement({}).beginParse();
    expect(s.loadUint(32)).toBe(0x56f40009);
    expect(s.remainingBits).toBe(0);
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
