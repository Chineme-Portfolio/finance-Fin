import "server-only";
import type { AccountDataResult } from "./types";
import type { CaptureReport } from "./capture";

/**
 * Holds the most recent observation per Item so the page can render it.
 *
 * Server memory only, anchored on globalThis for the same hot reload reason as
 * the connection store. This exists because spec 0001 deliberately has no
 * database: the observation is read once by a human and then written up, so
 * persisting it would mean storing real financial data for no benefit.
 */
export interface Observation {
  result: AccountDataResult;
  captures: CaptureReport[];
  observedAt: string;
}

const globalRef = globalThis as unknown as {
  __finbuddyObservations?: Map<string, Observation>;
};

function store(): Map<string, Observation> {
  if (!globalRef.__finbuddyObservations) {
    globalRef.__finbuddyObservations = new Map<string, Observation>();
  }
  return globalRef.__finbuddyObservations;
}

export function saveObservation(itemId: string, observation: Observation): void {
  store().set(itemId, observation);
}

export function getObservation(itemId: string): Observation | undefined {
  return store().get(itemId);
}
