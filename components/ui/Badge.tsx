import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

// Ported from design-system/source/components/core/Badge.jsx. Tokens only.

type BadgeTone = "neutral" | "brand" | "gain" | "loss" | "attention" | "ink";

const badgeTones: Record<BadgeTone, [string, string]> = {
  neutral: ["var(--bg-sunk)", "var(--text-muted)"],
  brand: ["var(--clay-100)", "var(--clay-600)"],
  gain: ["var(--data-gain-bg)", "var(--data-gain)"],
  loss: ["var(--data-loss-bg)", "var(--data-loss)"],
  attention: ["var(--data-attention-bg)", "var(--apricot-600)"],
  ink: ["var(--ink)", "var(--paper)"],
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: "sm" | "md";
  children: ReactNode;
}

export function Badge({ children, tone = "neutral", size = "md", style, ...rest }: BadgeProps) {
  const [bg, fg] = badgeTones[tone] ?? badgeTones.neutral;
  const sm = size === "sm";
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5, background: bg, color: fg,
    borderRadius: "var(--radius-pill)", padding: sm ? "3px 8px" : "5px 11px",
    fontFamily: "var(--font-sans)", fontSize: sm ? 11 : 12.5, fontWeight: 600,
    lineHeight: 1.2, letterSpacing: "0.01em", whiteSpace: "nowrap",
  };
  return <span style={{ ...base, ...style }} {...rest}>{children}</span>;
}
