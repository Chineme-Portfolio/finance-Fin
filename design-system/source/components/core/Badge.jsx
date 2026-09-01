import React from "react";

const badgeTones = {
  neutral: ["var(--bg-sunk)", "var(--text-muted)"],
  brand: ["var(--clay-100)", "var(--clay-600)"],
  gain: ["var(--data-gain-bg)", "var(--data-gain)"],
  loss: ["var(--data-loss-bg)", "var(--data-loss)"],
  attention: ["var(--data-attention-bg)", "var(--apricot-600)"],
  ink: ["var(--ink)", "var(--paper)"]
};

export function Badge({ children, tone = "neutral", size = "md", style, ...rest }) {
  const [bg, fg] = badgeTones[tone] || badgeTones.neutral;
  const sm = size === "sm";
  return <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    background: bg, color: fg, borderRadius: "var(--radius-pill)",
    padding: sm ? "3px 8px" : "5px 11px",
    fontFamily: "var(--font-sans)", fontSize: sm ? 11 : 12.5, fontWeight: 600,
    lineHeight: 1.2, letterSpacing: "0.01em", whiteSpace: "nowrap", ...style
  }} {...rest}>{children}</span>;
}
