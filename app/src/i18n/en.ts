import type { Messages } from './index';

export const en: Messages = {
  appName: 'Vote For Truth',
  feed: {
    title: 'Questions',
    important: 'Important',
    new: 'New',
    active: 'Active',
    empty: 'No questions yet',
    ask: 'Ask a question',
  },
  statement: {
    pro: 'Pro',
    con: 'Con',
    noArguments: 'No arguments yet',
    source: 'Source',
    author: 'Author',
    support: 'Support',
    dispute: 'Dispute',
    donate: 'Donate to the author',
    share: 'Share',
    hidden: 'Hidden by moderation',
    notFound: 'Statement not found',
  },
  votes: {
    voters: (n) => `${n} ${n === 1 ? 'voter' : 'voters'}`,
    arguments: (n) => `${n} ${n === 1 ? 'argument' : 'arguments'}`,
    concentration: (share, top) =>
      `${Math.round(share * 100)}% from ${top} ${top === 1 ? 'wallet' : 'wallets'}`,
    weightHint: 'A vote reaches its full weight in 7 days',
  },
  profile: {
    title: 'Profile',
    connect: 'Connect a wallet to vote and ask questions',
  },
  common: {
    loading: 'Loading…',
    error: 'Could not load data',
    retry: 'Retry',
  },
};
