import "server-only";
import type { LinkedConnection, LinkedItemSummary } from "./types";

/**
 * In memory connection store. Deliberately not a database.
 *
 * Spec 0001 keeps the access token off disk entirely: relinking after a restart
 * costs seconds, while a long lived credential sitting in plaintext next to the
 * captures directory is a real risk (security.md section 3).
 *
 * Anchored on globalThis rather than module scope because Next.js dev mode can
 * re-evaluate a module on hot reload and silently reset top level state. Losing
 * a token to a stray file save costs a Production Item to recover, and there are
 * only about ten of those.
 */
const globalRef = globalThis as unknown as {
  __finbuddyConnections?: Map<string, LinkedConnection>;
};

function store(): Map<string, LinkedConnection> {
  if (!globalRef.__finbuddyConnections) {
    globalRef.__finbuddyConnections = new Map<string, LinkedConnection>();
  }
  return globalRef.__finbuddyConnections;
}

export function saveConnection(connection: LinkedConnection): void {
  store().set(connection.itemId, connection);
}

/** Server side only. Never call this from anything that renders. */
export function getConnection(itemId: string): LinkedConnection | undefined {
  return store().get(itemId);
}

/** The safe listing: summaries only, no access tokens. */
export function listConnections(): LinkedItemSummary[] {
  return [...store().values()].map(({ itemId, institutionName, linkedAt }) => ({
    itemId,
    institutionName,
    linkedAt,
  }));
}
