import { useQuery } from '@tanstack/react-query';

import { config } from './config';

// Types mirror the JSON of vft-indexer (internal/api/http.go).
// Amounts and weights are nanotons as decimal strings.

export interface Votes {
  amount: string;
  weight: string;
  voters: number;
  top1_share: number;
  top3_share: number;
}

export interface Result {
  pro_weight: string;
  con_weight: string;
  pro_amount: string;
  con_amount: string;
}

export interface Statement {
  address: string;
  root: string;
  parent: string;
  depth: number;
  index: number;
  side: 'pro' | 'con';
  author: string;
  text: string;
  url: string | null;
  created_at: string;
  votes: Votes;
  donations: string;
  arguments: { pro: number; con: number };
  result: Result;
  activity_24h?: number;
  hidden?: { reason: string | null };
}

export interface StatementDetail {
  statement: Statement;
  pro: Statement[];
  con: Statement[];
}

export interface WalletVote {
  statement: string;
  root: string;
  text: string;
  side: 'pro' | 'con';
  depth: number;
  amount: string;
  weight: string;
  since: string;
}

export type FeedSort = 'weight' | 'new' | 'active';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(config.apiUrl + path);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

// The indexer follows the chain with ~1s lag; polling keeps screens fresh
// after the user's own transactions.
const REFRESH_MS = 5000;

export function useFeed(sort: FeedSort) {
  return useQuery({
    queryKey: ['feed', sort],
    queryFn: () =>
      get<{ total: number; statements: Statement[] }>(
        `/statements?sort=${sort}&limit=100`,
      ),
    refetchInterval: REFRESH_MS,
  });
}

export function useStatement(address: string) {
  return useQuery({
    queryKey: ['statement', address],
    queryFn: () => get<StatementDetail>(`/statements/${address}`),
    refetchInterval: REFRESH_MS,
    retry: (count, err) =>
      !(err instanceof ApiError && err.status < 500) && count < 2,
  });
}

export function useWalletVotes(wallet: string | null) {
  return useQuery({
    queryKey: ['wallet-votes', wallet],
    queryFn: () => get<{ votes: WalletVote[] }>(`/wallets/${wallet}/votes`),
    enabled: !!wallet,
    refetchInterval: REFRESH_MS,
  });
}

export function useWalletStatements(wallet: string | null) {
  return useQuery({
    queryKey: ['wallet-statements', wallet],
    queryFn: () =>
      get<{ statements: Statement[] }>(`/wallets/${wallet}/statements`),
    enabled: !!wallet,
    refetchInterval: REFRESH_MS,
  });
}
