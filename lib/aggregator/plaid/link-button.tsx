"use client";

import { useCallback, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import type { CreateLinkTokenResult, ExchangeResult } from "../types";

/**
 * The provider's own browser widget. Plaid Link has to run client side, so this
 * is the one client component that knows Plaid exists. It lives inside
 * lib/aggregator/plaid/ for the same reason everything else here does: a
 * provider swap or a revoked connection should change this directory and
 * nothing beyond it (foundation.md section 7 #8).
 *
 * It receives the Server Actions as props rather than importing them, so the
 * dependency runs app -> lib and never the other way (architecture.md section 4).
 * It never sees an access token; only the single use public token passes
 * through, straight back to the server.
 */
export function PlaidLinkButton({
  createLinkToken,
  exchangePublicToken,
}: {
  createLinkToken: () => Promise<CreateLinkTokenResult>;
  exchangePublicToken: (publicToken: string) => Promise<ExchangeResult>;
}) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      // react-plaid-link types this as possibly null. Handle it rather than
      // asserting it away: a null here means Link finished without a token, and
      // passing that on would surface as a confusing provider error.
      if (!publicToken) {
        setStatus("Link returned no public token. Nothing to exchange.");
        return;
      }
      setStatus("Exchanging...");
      const result = await exchangePublicToken(publicToken);
      setStatus(
        result.ok ? `Linked. Item ${result.itemId}` : `Failed: ${result.message}`,
      );
    },
    onExit: (error) => {
      setStatus(error ? `Link exited: ${error.error_code}` : "Link closed.");
    },
  });

  const start = useCallback(async () => {
    setStatus("Requesting link token...");
    const result = await createLinkToken();
    if (!result.ok) {
      setStatus(`Failed: ${result.message}`);
      return;
    }
    setLinkToken(result.linkToken);
    setStatus("Link token ready. Click Open Link.");
  }, [createLinkToken]);

  return (
    <div>
      <button onClick={start} type="button">
        1. Get link token
      </button>{" "}
      <button onClick={() => open()} type="button" disabled={!ready || !linkToken}>
        2. Open Link
      </button>
      {status ? <p>{status}</p> : null}
    </div>
  );
}
