import React from "react";

const toneMap = {
  surface: { bg: "var(--bg-surface)", bd: "var(--border-soft)", fg: "inherit" },
  sunk: { bg: "var(--bg-sunk)", bd: "transparent", fg: "inherit" },
  tint: { bg: "var(--bg-tint)", bd: "transparent", fg: "inherit" },
  warm: { bg: "var(--bg-tint-warm)", bd: "transparent", fg: "inherit" },
  brand: { bg: "var(--bg-brand)", bd: "transparent", fg: "var(--text-on-brand)" },
  inverse: { bg: "var(--ink)", bd: "transparent", fg: "var(--paper)" }
};

export function Card({ children, tone = "surface", elevation = 1, padding = "var(--pad-card)", radius = "var(--radius-md)", interactive = false, className = "", style, ...rest }) {
  const [h, setH] = React.useState(false);
  const t = toneMap[tone] || toneMap.surface;
  const shadows = ["none", "var(--shadow-1)", "var(--shadow-2)", "var(--shadow-3)"];
  const cls = (tone === "inverse" || tone === "brand" ? "fb-inverse " : "") + className;
  return (
    <div className={cls.trim() || undefined}
      onMouseEnter={interactive ? () => setH(true) : undefined}
      onMouseLeave={interactive ? () => setH(false) : undefined}
      style={{
        background: t.bg, color: t.fg,
        border: "1px solid " + t.bd, borderRadius: radius, padding,
        boxShadow: shadows[interactive && h ? Math.min(elevation + 1, 3) : elevation],
        transform: interactive && h ? "translateY(-2px)" : "none",
        transition: "box-shadow var(--dur-base) var(--ease-out),transform var(--dur-base) var(--ease-out)",
        ...style
      }} {...rest}>{children}</div>
  );
}
