import type { CSSProperties, HTMLAttributes } from "react";

// Ported from design-system/source/components/data/HoldingRow.jsx.
// The reference had hover state (useState) and optional percent/delta/onClick.
// On the "what you own" screen rows are non-interactive and carry no percent or
// delta (spec 0003 AC-10: no per-holding share or delta source), so this port is
// a pure presentational row: no state, no client directive, no chevron/Icon.
// `value` is a pre-formatted currency string (money formatting happens upstream).

interface HoldingRowProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  sub?: string;
  value: string;
  color?: string;
}

export function HoldingRow({ name, sub, value, color, style, ...rest }: HoldingRowProps) {
  const base: CSSProperties = {
    display: "flex", alignItems: "center", gap: 14, padding: "14px 12px", margin: "0 -12px",
    borderRadius: "var(--radius-sm)",
  };
  return (
    <div style={{ ...base, ...style }} {...rest}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color ?? "var(--chart-1)", flex: "none" }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "var(--body-m-size)", color: "var(--text-strong)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </span>
        {sub ? <span style={{ display: "block", fontSize: "var(--body-s-size)", color: "var(--text-faint)", marginTop: 1 }}>{sub}</span> : null}
      </span>
      <span className="fb-figure" style={{ fontSize: "var(--figure-s-size)", width: 92, textAlign: "right" }}>{value}</span>
    </div>
  );
}
