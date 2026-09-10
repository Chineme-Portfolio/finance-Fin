/**
 * Provider neutral types for the aggregator layer.
 *
 * Nothing in this file knows which provider is in use. That is the point:
 * foundation.md section 7 #8 keeps provider specifics behind an adapter, because
 * institution access is revocable and outside our control, and there is no
 * manual entry fallback (foundation.md section 7 #4).
 */

/**
 * The outcome of asking a provider for one product on one account.
 *
 * Four states, never three, and never collapsed into each other.
 * `empty` and `not_ready` and `error` mean genuinely different things:
 *   empty      the provider answered and there is nothing there
 *   not_ready  the provider has not finished populating this yet, ask again
 *   error      the provider refused or failed
 * Treating `not_ready` as `error` would let a race condition answer this
 * project's central question wrongly. See foundation.md section 7 #16.
 */
export type ProductStatus = "data" | "empty" | "not_ready" | "error";

export interface ProductOutcome {
  status: ProductStatus;
  /** The provider's own error code, kept verbatim rather than reinterpreted. */
  errorCode?: string;
  /** How many records came back. Only meaningful when status is "data". */
  recordCount?: number;
  /** How many calls it took, so a slow `not_ready` is visible rather than silent. */
  attempts: number;
}

/** What one linked account can actually give us. Discovered, never assumed. */
export interface AccountCapability {
  accountId: string;
  accountName: string;
  accountType: string;
  accountSubtype: string | null;
  holdings: ProductOutcome;
  investmentTransactions: ProductOutcome;
  observedAt: string;
}

/** The safe view of a linked item. Deliberately has no access token field. */
export interface LinkedItemSummary {
  itemId: string;
  institutionName: string;
  linkedAt: string;
}

/**
 * The result of exchanging a public token: a summary plus the access token,
 * returned to a SERVER SIDE caller only (the lib/sync orchestration, which
 * hands the token straight to Vault via lib/db). The access token is standing
 * read access to someone's financial accounts, not a one time snapshot
 * (security.md section 3), so it never leaves the server, never reaches a log,
 * and never touches disk. The client facing shape is ExchangeResult, which has
 * no token field.
 */
export interface ExchangedItem extends LinkedItemSummary {
  accessToken: string;
}

/**
 * One observed transaction, normalised just enough to read by eye.
 * Money is in integer minor units (cents). See code-standards.md section 2:
 * floating point drift in a product whose value is being correct about dollars
 * is not an acceptable class of bug.
 */
export interface ObservedTransaction {
  accountId: string;
  date: string;
  amountMinor: number;
  currency: string | null;
  name: string;
  type: string;
  subtype: string | null;
}

export interface AccountDataResult {
  capabilities: AccountCapability[];
  transactions: ObservedTransaction[];
  /** Untouched provider payloads, exactly as sent. Typed `unknown` on purpose. */
  rawHoldings: unknown;
  rawTransactions: unknown;
}

/**
 * The seam. Everything outside lib/aggregator/<provider>/ talks to this and
 * knows nothing about who implements it.
 */
export interface Aggregator {
  /** Which provider environment this is pointed at. Shown so a run is never ambiguous. */
  environmentName(): string;
  createLinkToken(): Promise<string>;
  /** Returns the access token to its server side caller (spec 0005); the caller persists it to Vault. */
  exchangePublicToken(publicToken: string): Promise<ExchangedItem>;
  /**
   * Fetch a linked item's data using its access token directly (spec 0005). The
   * token is passed in, not looked up from a store: the aggregator holds no
   * connection state, and Vault is the token's single durable home.
   */
  fetchAccountData(accessToken: string): Promise<AccountDataResult>;
}

/** Result shapes shared by the Server Actions and any link widget. One source of truth. */
export type CreateLinkTokenResult =
  | { ok: true; linkToken: string }
  | { ok: false; message: string };

export type ExchangeResult =
  | { ok: true; itemId: string }
  | { ok: false; message: string };
