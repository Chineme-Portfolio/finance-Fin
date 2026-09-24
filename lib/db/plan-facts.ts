import "server-only";
import { getAdminClient, currentUserId } from "./client";
import type { PlanFacts } from "@/lib/types";

/**
 * Typed, user-scoped persistence for plan facts (spec 0009, table from spec 0004).
 * Plan facts are the durable inputs F8 collects: the employer, the recognized match
 * formula (stored as its catalog entry id in `match_formula`), the current
 * contribution rate, and the remembered gross pay. One row per account, upserted.
 *
 * Money is bigint minor units; PostgREST returns bigint as a JSON STRING, so
 * `gross_pay_minor` is parsed back to a number here (same boundary rule as
 * lib/db/accounts.ts). `contribution_rate_bps` is a plain integer column.
 */

function toIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.length > 0 && !Number.isNaN(Number(v))) return Number(v);
  throw new Error(`db.plan-facts: expected a numeric value or null, got ${typeof v}: ${String(v)}`);
}

interface PlanFactsRow {
  account_id: string;
  employer: string | null;
  match_formula: string | null;
  contribution_rate_bps: number | null;
  gross_pay_minor: string | number | null;
}

function rowToPlanFacts(r: PlanFactsRow): PlanFacts {
  return {
    accountId: r.account_id,
    employer: r.employer,
    // `match_formula` holds the resolved catalog entry id (spec 0009); the caller
    // resolves it to a typed formula through getCatalogEntry.
    matchFormula: r.match_formula,
    contributionRateBps: r.contribution_rate_bps,
    grossPayMinor: toIntOrNull(r.gross_pay_minor),
  };
}

const COLUMNS = "account_id, employer, match_formula, contribution_rate_bps, gross_pay_minor";

/** The plan facts for one account, or null when none have been recorded yet. */
export async function getPlanFactsForAccount(accountId: string): Promise<PlanFacts | null> {
  const { data, error } = await getAdminClient()
    .from("plan_facts")
    .select(COLUMNS)
    .eq("user_id", currentUserId())
    .eq("account_id", accountId)
    .maybeSingle();
  if (error) throw new Error(`db.getPlanFactsForAccount: ${error.message}`);
  return data ? rowToPlanFacts(data as PlanFactsRow) : null;
}

/**
 * Upsert the plan facts for an account (unique on user_id + account_id, spec 0004).
 * Only the fields present are written; a partial update (say, just gross pay)
 * merges onto the existing row. `matchFormulaId` is stored verbatim in
 * `match_formula` (it is the catalog entry id, resolved on read).
 */
export async function savePlanFacts(input: {
  accountId: string;
  employer?: string | null;
  matchFormulaId?: string | null;
  contributionRateBps?: number | null;
  grossPayMinor?: number | null;
}): Promise<void> {
  const row: Record<string, unknown> = {
    user_id: currentUserId(),
    account_id: input.accountId,
  };
  if (input.employer !== undefined) row.employer = input.employer;
  if (input.matchFormulaId !== undefined) row.match_formula = input.matchFormulaId;
  if (input.contributionRateBps !== undefined) row.contribution_rate_bps = input.contributionRateBps;
  if (input.grossPayMinor !== undefined) row.gross_pay_minor = input.grossPayMinor;

  const { error } = await getAdminClient()
    .from("plan_facts")
    .upsert(row, { onConflict: "user_id,account_id" });
  if (error) throw new Error(`db.savePlanFacts: ${error.message}`);
}
