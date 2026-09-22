import "server-only";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

/**
 * The Plaid SDK client. This directory is the only place in the codebase that
 * knows Plaid exists (foundation.md section 7 #8).
 *
 * Every value here is server side only. No Plaid value may ever carry a
 * NEXT_PUBLIC_ prefix (security.md section 2), and none of them is ever logged.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Names the missing variable, never a value. security.md section 6.
    throw new Error(
      `plaid.client: ${name} is not set. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function plaidEnvName(): string {
  return process.env.PLAID_ENV ?? "sandbox";
}

export function plaidClient(): PlaidApi {
  const env = plaidEnvName();
  const basePath = PlaidEnvironments[env];
  if (!basePath) {
    throw new Error(
      `plaid.client: PLAID_ENV "${env}" is not a known Plaid environment.`,
    );
  }
  return new PlaidApi(
    new Configuration({
      basePath,
      baseOptions: {
        headers: {
          "PLAID-CLIENT-ID": required("PLAID_CLIENT_ID"),
          "PLAID-SECRET": required("PLAID_SECRET"),
        },
      },
    }),
  );
}

/**
 * Pull the provider's own error code out of a thrown SDK error without using
 * `any` (code-standards.md section 2). The code is kept verbatim rather than
 * reinterpreted, because reinterpreting it is how "not ready" becomes "empty".
 */
export function plaidErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const response = (error as { response?: unknown }).response;
  if (typeof response !== "object" || response === null) return undefined;
  const data = (response as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return undefined;
  const code = (data as { error_code?: unknown }).error_code;
  return typeof code === "string" ? code : undefined;
}
