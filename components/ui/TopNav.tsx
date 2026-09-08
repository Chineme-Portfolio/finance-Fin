import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Wordmark } from "./Wordmark";

// Ported from design-system/source/components/navigation/TopNav.jsx, minimal.
// CHANGED FROM THE REFERENCE (spec 0003 AC-1): the reference hardcoded the hex
// values #332C25 and #2C251E for the inverse tone. Those are a raw-hex token
// violation (ui-tokens.md §7). This port uses the semantic tokens the .fb-inverse
// scope already remaps (--border-soft, --action-ghost-hover), so no hex appears.
// The reference's default IconButton in the `right` slot is dropped to avoid a
// dependency the first screen does not need; `right` is optional.

interface TopNavProps extends HTMLAttributes<HTMLElement> {
  items?: string[];
  active?: string;
  right?: ReactNode;
  tone?: "paper" | "ink";
}

export function TopNav({ items = [], active, right, tone = "paper", style, ...rest }: TopNavProps) {
  const inverse = tone === "ink";
  const header: CSSProperties = {
    display: "flex", alignItems: "center", gap: 32, height: "var(--topbar-h)",
    padding: "0 var(--page-gutter)", background: inverse ? "var(--ink)" : "var(--bg-page)",
    borderBottom: "1px solid var(--border-soft)",
  };
  return (
    <header className={inverse ? "fb-inverse" : undefined} style={{ ...header, ...style }} {...rest}>
      <Wordmark size={17} tone={inverse ? "paper" : "ink"} />
      <nav className="fb-navscroll" style={{ display: "flex", gap: 4, flex: 1, minWidth: 0, overflowX: "auto" }}>
        {items.map((it) => {
          const on = it === active;
          const btn: CSSProperties = {
            border: 0,
            background: on ? (inverse ? "var(--action-ghost-hover)" : "var(--paper-deep)") : "transparent",
            borderRadius: "var(--radius-pill)", padding: "8px 15px", cursor: "pointer",
            fontSize: "var(--body-s-size)", fontWeight: on ? 600 : 500,
            color: on ? "var(--text-strong)" : "var(--text-muted)",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
          };
          // Rendered as a span, not a button: this shell nav is presentational on
          // the first screen (no routing wired yet). A real button/link arrives
          // with the other nav destinations (spec 0003 Follow-up).
          return (
            <span key={it} aria-current={on ? "page" : undefined} style={btn}>
              {it}
            </span>
          );
        })}
      </nav>
      {right ?? null}
    </header>
  );
}
