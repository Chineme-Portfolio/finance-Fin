import { loadWhatYouOwnLive } from "@/lib/view/what-you-own";
import type { AccountView } from "@/lib/view/what-you-own";
import type { Insight } from "@/lib/types";
import { formatMoney, formatBps, minorToMajorNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Rule } from "@/components/ui/Rule";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { AllocationBar } from "@/components/ui/AllocationBar";
import type { AllocationSegment } from "@/components/ui/AllocationBar";
import { HoldingRow } from "@/components/ui/HoldingRow";
import { TopNav } from "@/components/ui/TopNav";

/**
 * The "what you own" screen (spec 0003, live data in spec 0005). A React Server
 * Component: it loads the view model from the database through the real engine
 * and renders it in the design system. It computes no financial figure; every
 * number comes from an Insight or the pure lib helpers (foundation.md §4 #1,
 * spec 0003 AC-6).
 *
 * Dashboard-first shell (foundation.md §7 #17): you land on your money.
 */

// Rendered per request: the data source is live (lib/db), so the route is kept
// dynamic rather than statically cached.
export const dynamic = "force-dynamic";

function accountLabel(type: string): string {
  const map: Record<string, string> = {
    "401k": "401(k)",
    roth_ira: "Roth IRA",
    traditional_ira: "Traditional IRA",
    taxable_brokerage: "Brokerage",
    hsa: "HSA",
  };
  return map[type] ?? "Investment account";
}

function compositionOf(insights: Insight[]) {
  return insights.find((i): i is Extract<Insight, { kind: "composition" }> => i.kind === "composition");
}

function AccountSection({ view }: { view: AccountView }) {
  const { account, insights, holdings, seesHoldings } = view;

  // The missing-capability state: balance visible, holdings not (spec 0003 AC-5,
  // foundation.md §4 #7). Never a blank or a $0.
  if (!seesHoldings) {
    return (
      <Card tone="sunk" elevation={0} padding="var(--pad-card-lg)">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
          <h2 style={{ fontSize: "var(--title-l-size)", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            {accountLabel(account.type)}
          </h2>
          <Badge tone="neutral">Balance only</Badge>
        </div>
        <div style={{ marginTop: 16 }}>
          <Stat
            label="Balance"
            value={account.balanceMinor === null ? "Not available" : minorToMajorNumber(account.balanceMinor)}
            size="l"
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, color: "var(--text-muted)", fontSize: "var(--body-m-size)" }}>
          <span style={{ color: "var(--text-faint)", flex: "none", marginTop: 2 }}>
            <Icon name="info" size={18} />
          </span>
          <p style={{ maxWidth: "var(--measure-narrow)" }}>
            We can see this account&rsquo;s balance, but your plan doesn&rsquo;t share what&rsquo;s inside it yet, so we
            can&rsquo;t break down what you own here. Nothing is missing from your account.
          </p>
        </div>
      </Card>
    );
  }

  const composition = compositionOf(insights);
  const segments: AllocationSegment[] = composition
    ? composition.groups.map((g, i) => ({
        label: g.securityType,
        value: g.shareBps,
        note: formatBps(g.shareBps),
        color: `var(--chart-${(i % 5) + 1})`,
      }))
    : [];

  return (
    <Card padding="var(--pad-card-lg)">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <h2 style={{ fontSize: "var(--title-l-size)", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
          {accountLabel(account.type)}
        </h2>
        {composition ? (
          <Stat value={minorToMajorNumber(composition.accountTotalMinor)} size="s" />
        ) : null}
      </div>

      {segments.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          <AllocationBar showLegend segments={segments} />
        </div>
      ) : null}

      <div style={{ marginTop: 8 }}>
        {holdings.map((h, i) => (
          <div key={h.security.securityId}>
            {i > 0 ? <Rule /> : null}
            <HoldingRow
              name={h.security.ticker ?? h.security.name}
              sub={h.security.ticker ? `${h.security.name} · ${h.security.securityType}` : h.security.securityType}
              value={formatMoney(h.valueMinor)}
              color={`var(--chart-${(i % 5) + 1})`}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState() {
  // No account linked yet (spec 0005 AC-4): a plain prompt, never a blank, a
  // crash, or fake data. The link surface is the dev spike page for now (UI is
  // deferred by preference).
  return (
    <Card padding="var(--pad-card-lg)">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ color: "var(--text-faint)", flex: "none", marginTop: 2 }}>
          <Icon name="info" size={18} />
        </span>
        <div>
          <h2 style={{ fontSize: "var(--title-l-size)", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
            No account linked yet
          </h2>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: "var(--body-m-size)", maxWidth: "var(--measure-narrow)" }}>
            Link an investment account to see what you own. You can link one from the{" "}
            <a href="/dev/plaid-spike" style={{ color: "var(--text)", textDecoration: "underline" }}>
              link page
            </a>
            . FINBUDDY reads your balances and holdings; it cannot move money, place trades, or change your plan.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default async function Page() {
  const view = await loadWhatYouOwnLive();
  const hasAccounts = view.accounts.length > 0;

  return (
    <>
      <TopNav
        items={["Overview", "What you own", "Match", "Ask Fin"]}
        active="What you own"
        hrefs={{ "What you own": "/", Match: "/match" }}
      />
      <main
        style={{
          maxWidth: "var(--page-max)",
          margin: "0 auto",
          padding: "var(--gap-section) var(--page-gutter)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-section)",
        }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="fb-label">What you own</span>
          <Stat label="Everything you own" value={minorToMajorNumber(view.portfolioTotalMinor)} size="xl" animate />
          <Rule tone="strong" style={{ maxWidth: 64, marginTop: 12 }} />
        </header>

        <section style={{ display: "flex", flexDirection: "column", gap: "var(--gap-stack)" }}>
          {hasAccounts ? (
            view.accounts.map((v) => <AccountSection key={v.account.id} view={v} />)
          ) : (
            <EmptyState />
          )}
        </section>

        {hasAccounts ? (
          <p style={{ color: "var(--text-faint)", fontSize: "var(--caption-size)", maxWidth: "var(--measure-prose)" }}>
            FINBUDDY reads your balances and holdings; it cannot move money, place trades, or change your plan.
          </p>
        ) : null}
      </main>
    </>
  );
}
