"use client";

import { useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

// Ported from design-system/source/components/core/Card.jsx. Tokens only.
// 'use client' because interactive hover uses state. tone="inverse"/"brand" apply
// the .fb-inverse token scope so children invert (ui-tokens.md §6).

type CardTone = "surface" | "sunk" | "tint" | "warm" | "brand" | "inverse";

const toneMap: Record<CardTone, { bg: string; bd: string; fg: string }> = {
  surface: { bg: "var(--bg-surface)", bd: "var(--border-soft)", fg: "inherit" },
  sunk: { bg: "var(--bg-sunk)", bd: "transparent", fg: "inherit" },
  tint: { bg: "var(--bg-tint)", bd: "transparent", fg: "inherit" },
  warm: { bg: "var(--bg-tint-warm)", bd: "transparent", fg: "inherit" },
  brand: { bg: "var(--bg-brand)", bd: "transparent", fg: "var(--text-on-brand)" },
  inverse: { bg: "var(--ink)", bd: "transparent", fg: "var(--paper)" },
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  elevation?: 0 | 1 | 2 | 3;
  padding?: string | number;
  radius?: string | number;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({
  children, tone = "surface", elevation = 1, padding = "var(--pad-card)",
  radius = "var(--radius-md)", interactive = false, className = "", style, ...rest
}: CardProps) {
  const [hovered, setHovered] = useState(false);
  const t = toneMap[tone] ?? toneMap.surface;
  const shadows = ["none", "var(--shadow-1)", "var(--shadow-2)", "var(--shadow-3)"];
  const cls = ((tone === "inverse" || tone === "brand" ? "fb-inverse " : "") + className).trim();
  const base: CSSProperties = {
    background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, borderRadius: radius, padding,
    boxShadow: shadows[interactive && hovered ? Math.min(elevation + 1, 3) : elevation],
    transform: interactive && hovered ? "translateY(-2px)" : "none",
    transition: "box-shadow var(--dur-base) var(--ease-out),transform var(--dur-base) var(--ease-out)",
  };
  return (
    <div
      className={cls || undefined}
      onMouseEnter={interactive ? () => setHovered(true) : undefined}
      onMouseLeave={interactive ? () => setHovered(false) : undefined}
      style={{ ...base, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
