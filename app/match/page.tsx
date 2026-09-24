import { loadMatch } from "@/lib/view/match";
import { TopNav } from "@/components/ui/TopNav";
import { Rule } from "@/components/ui/Rule";
import { MatchWalk } from "./MatchWalk";

/**
 * The Match surface (spec 0009, F8). A React Server Component: it loads the walk
 * view model (which runs the engine over the user's plan facts and contribution
 * history) and hands it to the client walk. It computes no figure of its own
 * (foundation.md §4 #1). Dashboard-first shell (foundation.md §7 #17): the user
 * opens this from the dashboard nav.
 */

// Live data source (lib/db), so the route is rendered per request.
export const dynamic = "force-dynamic";

export default async function MatchPage() {
  const view = await loadMatch();

  return (
    <>
      <TopNav
        items={["Overview", "What you own", "Match", "Ask Fin"]}
        active="Match"
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
        <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="fb-label">Your employer match</span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--display-3-size)",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              color: "var(--text-strong)",
              margin: 0,
            }}
          >
            Turn on your match
          </h1>
          <Rule tone="strong" style={{ maxWidth: 64, marginTop: 12 }} />
        </header>

        <MatchWalk view={view} />
      </main>
    </>
  );
}
