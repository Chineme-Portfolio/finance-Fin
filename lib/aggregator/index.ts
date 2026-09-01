import "server-only";
import { createPlaidAggregator } from "./plaid";
import type { Aggregator } from "./types";

/**
 * Composition root for the aggregator seam.
 *
 * This single import is the one deliberate reference to a provider outside its
 * own directory: something has to wire the implementation in. Everywhere else
 * depends on the `Aggregator` interface only, so swapping provider, or losing
 * one to a revoked connection, changes this file and nothing beyond it
 * (foundation.md section 7 #8).
 */
export function getAggregator(): Aggregator {
  return createPlaidAggregator();
}

export * from "./types";
export { mapHoldingsResponseToDomain } from "./plaid/map";
export { listConnections } from "./connection-store";
