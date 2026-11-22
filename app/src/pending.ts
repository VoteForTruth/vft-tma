import { useSyncExternalStore } from 'react';

// Transactions the user has sent but the indexer has not shown yet. A new
// statement reaches the chain and the indexer in a few seconds to half a
// minute; until then the lists show it as "publishing" instead of nothing,
// and a deleted statement as "deleting" instead of unchanged.

export interface PendingStatement {
  id: number;
  // master for a root statement, otherwise the parent statement
  parent: string | null;
  pro: boolean;
  text: string;
  sentAt: number;
}

// after this the item is shown as "not confirmed" (the wallet may have failed)
export const PENDING_TIMEOUT_MS = 120_000;

let created: PendingStatement[] = [];
let deleting = new Set<string>();
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addPendingStatement(
  parent: string | null,
  pro: boolean,
  text: string,
) {
  created = [
    ...created,
    { id: nextId++, parent, pro, text, sentAt: Date.now() },
  ];
  emit();
}

// Drops pending items that the indexer already returns (same text under the
// same parent). Called by the lists when fresh data arrives.
export function resolvePendingStatements(
  parent: string | null,
  texts: string[],
) {
  const seen = new Set(texts);
  const left = created.filter(
    (p) => !(sameParent(p.parent, parent) && seen.has(p.text)),
  );
  if (left.length !== created.length) {
    created = left;
    emit();
  }
}

export function dismissPendingStatement(id: number) {
  created = created.filter((p) => p.id !== id);
  emit();
}

export function markDeleting(address: string) {
  deleting = new Set(deleting).add(address);
  emit();
}

// Pending statements under `parent`; undefined returns all of them.
export function pendingUnder(
  all: PendingStatement[],
  parent: string | null | undefined,
) {
  return parent === undefined
    ? all
    : all.filter((p) => sameParent(p.parent, parent));
}

export function getPendingStatements() {
  return created;
}

export function usePendingStatements(parent: string | null | undefined) {
  const all = useSyncExternalStore(subscribe, getPendingStatements);
  return pendingUnder(all, parent);
}

export function useDeleting() {
  return useSyncExternalStore(subscribe, () => deleting);
}

function sameParent(a: string | null, b: string | null) {
  return a === b;
}
