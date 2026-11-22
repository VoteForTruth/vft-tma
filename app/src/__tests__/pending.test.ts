import { describe, expect, it } from 'vitest';

import {
  addPendingStatement,
  dismissPendingStatement,
  getPendingStatements,
  pendingUnder,
  resolvePendingStatements,
} from '@/pending';

const under = (parent: string | null) =>
  pendingUnder(getPendingStatements(), parent);

describe('pending statements', () => {
  it('stays until the indexer returns the same text under the same parent', () => {
    addPendingStatement(null, true, 'New question');
    addPendingStatement('kQParent', false, 'A con argument');
    expect(under(null).map((p) => p.text)).toEqual(['New question']);
    expect(under('kQParent').map((p) => p.pro)).toEqual([false]);

    // the same text under another parent is a different statement
    resolvePendingStatements('kQOther', ['A con argument']);
    expect(under('kQParent')).toHaveLength(1);

    resolvePendingStatements(null, ['New question']);
    expect(under(null)).toHaveLength(0);

    dismissPendingStatement(under('kQParent')[0].id);
    expect(getPendingStatements()).toHaveLength(0);
  });
});
