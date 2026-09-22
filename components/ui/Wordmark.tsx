import type { CSSProperties, HTMLAttributes } from "react";

// Ported from design-system/source/components/core/Wordmark.jsx. Tokens only.
// The brand signature: Instrument Serif, uppercase, tracked. No drawn logo exists.

interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
  tone?: "ink" | "paper" | "clay";
}

export function Wordmark({ size = 16, tone = "ink", style, ...rest }: WordmarkProps) {
  const color = tone === "paper" ? "var(--paper)" : tone === "clay" ? "var(--clay-500)" : "var(--text-strong)";
  const base: CSSProperties = {
    fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.18em",
    fontSize: size, lineHeight: 1, color, whiteSpace: "nowrap",
  };
  return <span style={{ ...base, ...style }} {...rest}>Finbuddy</span>;
}
