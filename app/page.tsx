import { getAggregator, listConnections } from "@/lib/aggregator";
import { getObservation } from "@/lib/aggregator/observation-store";
import type { ProductOutcome } from "@/lib/aggregator";
import { PlaidLinkButton } from "@/lib/aggregator/plaid/link-button";
import {
  createLinkTokenAction,
  exchangePublicTokenAction,
  observeAction,
  sandboxLinkFormAction,
} from "./actions";

/**
 * Disposable (spec 0001, task 7). Deliberately unstyled so that no look and
 * feel is established before the design system exists. Its only job is to make
 * one observation readable by eye, then be deleted.
 */

export const dynamic = "force-dynamic";

function describe(outcome: ProductOutcome): string {
  switch (outcome.status) {
    case "data":
      return `data (${outcome.recordCount} records, ${outcome.attempts} attempt(s))`;
    case "empty":
      return `EMPTY: the provider answered and there is nothing here (${outcome.attempts} attempt(s))`;
    case "not_ready":
      return `NOT READY: still populating after ${outcome.attempts} attempts (${outcome.errorCode})`;
    case "error":
      return `ERROR: ${outcome.errorCode} (${outcome.attempts} attempt(s))`;
  }
}

function money(minor: number, currency: string | null): string {
  return `${(minor / 100).toFixed(2)} ${currency ?? ""}`.trim();
}

export default function Page() {
  const connections = listConnections();
  const env = getAggregator().environmentName();

  return (
    <main>
      <h1>FINBUDDY read spike</h1>
      <p>
        Plaid environment: <strong>{env}</strong>
        {env !== "sandbox" ? " — real Items are being consumed" : ""}
      </p>
      <p>Local only. Never deploy this: there is no authentication.</p>

      <h2>Link an account</h2>
      <PlaidLinkButton
        createLinkToken={createLinkTokenAction}
        exchangePublicToken={exchangePublicTokenAction}
      />

      {env === "sandbox" ? (
        <form action={sandboxLinkFormAction}>
          <p>
            Or skip the widget and mint a sandbox investments account directly
            (dev only, sandbox only):
          </p>
          <button type="submit">Link a sandbox investments account</button>
        </form>
      ) : null}

      {connections.length === 0 ? (
        <p>No live connections. A server restart clears them, which is expected.</p>
      ) : null}

      {connections.map((connection) => {
        const observation = getObservation(connection.itemId);
        return (
          <section key={connection.itemId}>
            <h2>Item {connection.itemId}</h2>
            <form action={observeAction}>
              <input type="hidden" name="itemId" value={connection.itemId} />
              <button type="submit">Fetch holdings and investment transactions</button>
            </form>

            {!observation ? null : (
              <>
                <h3>What this connection actually supports</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Type</th>
                      <th>Holdings</th>
                      <th>Investment transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observation.result.capabilities.map((c) => (
                      <tr key={c.accountId}>
                        <td>{c.accountName}</td>
                        <td>
                          {c.accountType}
                          {c.accountSubtype ? ` / ${c.accountSubtype}` : ""}
                        </td>
                        <td>{describe(c.holdings)}</td>
                        <td>{describe(c.investmentTransactions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3>
                  Investment transactions ({observation.result.transactions.length})
                </h3>
                <p>
                  Look for two deposits on the same date. That pairing, and the ratio
                  between them, is what the match detection rests on.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Subtype</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observation.result.transactions.map((t, i) => (
                      <tr key={`${t.accountId}-${t.date}-${i}`}>
                        <td>{t.date}</td>
                        <td>{money(t.amountMinor, t.currency)}</td>
                        <td>{t.name}</td>
                        <td>{t.type}</td>
                        <td>{t.subtype ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3>Captures</h3>
                <ul>
                  {observation.captures.map((c) => (
                    <li key={c.label}>
                      {c.label}: raw written. Leak check{" "}
                      {c.leakCheckPassed
                        ? "PASSED, fixture written"
                        : `FAILED, fixture withheld (${c.violations.join(", ")})`}
                    </li>
                  ))}
                </ul>

                <h3>Raw holdings</h3>
                <pre>{JSON.stringify(observation.result.rawHoldings, null, 2)}</pre>
              </>
            )}
          </section>
        );
      })}
    </main>
  );
}

