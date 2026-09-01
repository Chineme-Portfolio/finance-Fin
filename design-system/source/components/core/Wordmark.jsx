import React from "react";

export function Wordmark({ size = 16, tone = "ink", style, ...rest }) {
  const color = tone === "paper" ? "var(--paper)" : tone === "clay" ? "var(--clay-500)" : "var(--text-strong)";
  return <span style={{
    fontFamily: "var(--font-display)", textTransform: "uppercase",
    letterSpacing: "0.18em", fontSize: size, lineHeight: 1, color,
    whiteSpace: "nowrap", ...style
  }} {...rest}>Finbuddy</span>;
}
