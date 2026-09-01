// Pure data transformation: no secrets, no filesystem, no environment.
// Deliberately not marked server-only so it can be exercised directly.

/**
 * Turns a raw provider capture into a committable fixture.
 *
 * This is NOT redaction. Copying real values and blanking a few fields around
 * them is the failure mode spec 0001 calls out: it looks safe and is not. The
 * facts that make a fixture useful (cadence, the ratio between paired deposits)
 * are exactly the facts that reveal an employer, a pay schedule, and a salary to
 * close approximation (security.md section 1).
 *
 * So values are generated, never copied:
 *   dates    shifted by one random offset per capture, a whole number of weeks,
 *            so weekday and cadence survive but the real calendar does not
 *   money    scaled by one random factor per capture, so the ratio between a
 *            deferral and its match survives but the real amount does not
 *   names    replaced outright, with a stable mapping so relationships hold
 *
 * Nothing is committed until leakCheck passes (spec 0001 AC-9).
 */

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** Keys whose values are money or quantities. Scaled. */
const NUMERIC_KEYS = new Set([
  "amount", "price", "quantity", "value", "fees",
  "institution_price", "institution_value", "cost_basis",
  "vested_value", "vested_quantity", "close_price",
  "available", "current", "limit",
]);

/** Keys whose values are dates. Shifted. */
const DATE_KEYS = new Set([
  "date", "start_date", "end_date", "posted_date", "settlement_date",
  "institution_price_as_of", "close_price_as_of", "last_updated_datetime",
]);

/** Keys whose values identify a person, an account, an employer, or a security. */
const IDENTIFYING_KEYS = new Set([
  "account_id", "item_id", "security_id", "investment_transaction_id",
  "institution_id", "account_owner", "request_id", "cancel_transaction_id",
  "name", "official_name", "ticker_symbol", "cusip", "isin", "sedol", "mask",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

export interface SynthesisResult {
  fixture: Json;
  /** Recorded so the transformation is explainable later, not so it can be undone. */
  notes: { dateShiftDays: number; amountScale: number };
}

export function synthesize(raw: unknown): SynthesisResult {
  // One offset and one factor for the whole capture, so every relationship
  // inside it stays intact.
  const dateShiftDays = (Math.floor(Math.random() * 40) + 12) * 7 * (Math.random() < 0.5 ? -1 : 1);
  const amountScale = Number((0.4 + Math.random() * 1.9).toFixed(4));
  const nameMap = new Map<string, string>();

  function fakeName(key: string, original: string): string {
    const cached = nameMap.get(original);
    if (cached) return cached;
    const n = nameMap.size + 1;
    const made =
      key === "ticker_symbol" ? `TCK${n}`
      : key === "mask" ? String(1000 + n).slice(-4)
      : key.endsWith("_id") || key === "request_id" ? `synthetic-${key}-${n}`
      : `Synthetic ${key.replace(/_/g, " ")} ${n}`;
    nameMap.set(original, made);
    return made;
  }

  function shiftDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    parsed.setDate(parsed.getDate() + dateShiftDays);
    return value.length === 10
      ? parsed.toISOString().slice(0, 10)
      : parsed.toISOString();
  }

  function walk(node: unknown, key: string): Json {
    if (node === null) return null;
    if (Array.isArray(node)) return node.map((item) => walk(item, key));
    if (typeof node === "object") {
      const out: { [k: string]: Json } = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        out[k] = walk(v, k);
      }
      return out;
    }
    if (typeof node === "number") {
      if (NUMERIC_KEYS.has(key)) return Number((node * amountScale).toFixed(4));
      return node;
    }
    if (typeof node === "string") {
      if (DATE_KEYS.has(key) || ISO_DATE.test(node)) return shiftDate(node);
      if (IDENTIFYING_KEYS.has(key)) return fakeName(key, node);
      return node;
    }
    return node as Json;
  }

  return { fixture: walk(raw, "root"), notes: { dateShiftDays, amountScale } };
}

export interface LeakReport {
  passed: boolean;
  violations: string[];
}

/**
 * Proves no real sensitive value survived into the fixture.
 *
 * Only sensitive leaves are compared, not every leaf. Structural values are
 * meant to survive: an enum like "buy", a currency code, a boolean, a field
 * name. Flagging those would make the check cry wolf and get ignored, which is
 * worse than not having it. What must never survive is a real number at a money
 * key, a real date, or a real identifying string.
 */
export function leakCheck(raw: unknown, fixture: unknown): LeakReport {
  const sensitive = new Set<string>();

  function collect(node: unknown, key: string): void {
    if (node === null) return;
    if (Array.isArray(node)) return node.forEach((n) => collect(n, key));
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) collect(v, k);
      return;
    }
    if (typeof node === "number" && NUMERIC_KEYS.has(key) && node !== 0) {
      sensitive.add(`${key}=${node}`);
    }
    if (typeof node === "string") {
      if (DATE_KEYS.has(key) || ISO_DATE.test(node)) sensitive.add(`${key}=${node}`);
      if (IDENTIFYING_KEYS.has(key) && node.length > 0) sensitive.add(`${key}=${node}`);
    }
  }

  const survived: string[] = [];
  function inspect(node: unknown, key: string): void {
    if (node === null) return;
    if (Array.isArray(node)) return node.forEach((n) => inspect(n, key));
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) inspect(v, k);
      return;
    }
    const probe =
      typeof node === "number" || typeof node === "string" ? `${key}=${node}` : null;
    if (probe && sensitive.has(probe)) survived.push(probe);
  }

  collect(raw, "root");
  inspect(fixture, "root");

  return { passed: survived.length === 0, violations: [...new Set(survived)] };
}
