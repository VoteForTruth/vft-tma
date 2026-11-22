import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CHAIN,
  useTonAddress,
  useTonConnectUI,
  UserRejectsError,
} from '@tonconnect/ui-react';
import { Address, beginCell, type Cell } from '@ton/core';

import { VftMaster } from '@wrappers/VftMaster.gen';
import { VftStatement } from '@wrappers/VftStatement.gen';
import { VftVote } from '@wrappers/VftVote.gen';
import { config } from './config';
import { langToUint16 } from './lang';

// Values attached to messages, in nanotons. The contracts return everything
// that is not needed: the change of a deploy, the excess gas of a vote.
// Keep in sync with vft-contract/contracts/types.tolk.
export const STATEMENT_RESERVE = 50_000_000n; // stays in a statement contract for storage
const CREATE_VALUE = 150_000_000n; // reserve + gas, at least 0.1 GRAM is required
const VOTE_EXTRA = 100_000_000n; // gas on top of the vote amount, at least 0.05 GRAM is required
const CONTROL_VALUE = 50_000_000n; // gas for revoke messages
export const MAX_STATEMENT_BYTES = 500;
export const MAX_URL_BYTES = 256;

export interface StatementData {
  statement: string;
  url: string | null;
  lang: string; // ISO 639-1, required by the contract
}

export type TxResult = 'sent' | 'cancelled';

// Sends VFT messages through the connected TON Connect wallet.
export function useVftActions() {
  const [tonConnectUI] = useTonConnectUI();
  const rawWallet = useTonAddress(false);
  const queryClient = useQueryClient();

  const send = useCallback(
    async (to: string, amount: bigint, body: Cell): Promise<TxResult> => {
      if (!tonConnectUI.connected) {
        await tonConnectUI.openModal();
        return 'cancelled';
      }
      try {
        await tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 300,
          network: config.network === 'testnet' ? CHAIN.TESTNET : CHAIN.MAINNET,
          messages: [
            {
              address: to,
              amount: amount.toString(),
              payload: body.toBoc().toString('base64'),
            },
          ],
        });
      } catch (err) {
        if (err instanceof UserRejectsError) return 'cancelled';
        throw err;
      }
      // the indexer picks the transaction up within seconds; refresh everything
      for (const delay of [3000, 6000, 10000, 15000]) {
        setTimeout(() => void queryClient.invalidateQueries(), delay);
      }
      return 'sent';
    },
    [tonConnectUI, queryClient],
  );

  return {
    connected: !!rawWallet,

    createRoot: (data: StatementData) =>
      send(
        config.master,
        CREATE_VALUE,
        VftMaster.createCellOfNewParentStatement({ data: vftData(data) }),
      ),

    createArgument: (parent: string, pro: boolean, data: StatementData) =>
      send(
        parent,
        CREATE_VALUE,
        VftStatement.createCellOfNewChildStatement({
          data: vftData(data),
          pro,
        }),
      ),

    vote: (statement: string, amount: bigint) =>
      send(
        statement,
        amount + VOTE_EXTRA,
        VftStatement.createCellOfVote({ amount }),
      ),

    // revokes `amount` nanotons, or the whole vote (the vote contract is destroyed)
    revoke: (statement: string, amount: bigint | 'all') => {
      const vote = VftVote.fromStorage({
        statement: Address.parse(statement),
        owner: Address.parse(rawWallet),
        amount: 0n,
      }).address.toString();
      const body =
        amount === 'all'
          ? VftVote.createCellOfWithdrawAll({})
          : VftVote.createCellOfWithdraw({ amount });
      return send(vote, CONTROL_VALUE, body);
    },

    // replaces the source link of the author's statement (null removes it);
    // the text never changes, the indexer keeps the public history of links
    setUrl: (statement: string, url: string | null) =>
      send(statement, CONTROL_VALUE, VftStatement.createCellOfSetUrl({ url })),

    // deletes the author's statement while it has no arguments; the contract
    // checks both, and its storage reserve comes back to the author
    deleteStatement: (statement: string) =>
      send(
        statement,
        CONTROL_VALUE,
        VftStatement.createCellOfDeleteStatement({}),
      ),

    // the same as sending GRAM with the comment "donate" from any wallet
    donate: (statement: string, amount: bigint) =>
      send(
        statement,
        amount,
        beginCell().storeUint(0, 32).storeStringTail('donate').endCell(),
      ),
  };
}

function vftData(data: StatementData) {
  return {
    $: 'VftData' as const,
    statement: data.statement,
    url: data.url,
    lang: langToUint16(data.lang),
  };
}
