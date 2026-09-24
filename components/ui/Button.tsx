"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Icon } from "./Icon";

// Ported from design-system/source/components/core/Button.jsx. Tokens only (the
// export's raw "#FFFFFF" inverse hover is replaced with var(--white)). One primary
// per view (ui-rules.md §3); `pop` (apricot) is for win moments only.

type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "pop";
type ButtonSize = "sm" | "md" | "lg";

const sizes: Record<ButtonSize, { h: string; px: number; fs: string; gap: number; icon: number }> = {
  sm: { h: "var(--control-h-sm)", px: 14, fs: "var(--body-s-size)", gap: 6, icon: 15 },
  md: { h: "var(--control-h)", px: 18, fs: "var(--body-m-size)", gap: 8, icon: 17 },
  lg: { h: "var(--control-h-lg)", px: 24, fs: "var(--body-l-size)", gap: 9, icon: 19 },
};

const tones: Record<ButtonVariant, { bg: string; fg: string; bd: string; hover: string; press: string; shadow: string }> = {
  primary: { bg: "var(--action-primary-bg)", fg: "var(--action-primary-fg)", bd: "transparent", hover: "var(--action-primary-hover)", press: "var(--action-primary-press)", shadow: "var(--shadow-pop)" },
  secondary: { bg: "var(--action-secondary-bg)", fg: "var(--action-secondary-fg)", bd: "var(--border-hairline)", hover: "var(--bg-sunk)", press: "var(--paper-deep)", shadow: "var(--shadow-1)" },
  ghost: { bg: "transparent", fg: "var(--text-body)", bd: "transparent", hover: "var(--action-ghost-hover)", press: "var(--paper-deep)", shadow: "none" },
  inverse: { bg: "var(--paper)", fg: "var(--ink)", bd: "transparent", hover: "var(--white)", press: "var(--paper-deep)", shadow: "none" },
  pop: { bg: "var(--apricot-500)", fg: "var(--ink)", bd: "transparent", hover: "var(--apricot-400)", press: "var(--apricot-600)", shadow: "var(--shadow-1)" },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: string;
  iconRight?: string;
  full?: boolean;
  pill?: boolean;
}

export function Button({
  children, variant = "primary", size = "md", iconLeft, iconRight, full = false,
  disabled = false, pill = true, style, ...rest
}: ButtonProps) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = sizes[size] ?? sizes.md;
  const t = tones[variant] ?? tones.primary;
  const base: CSSProperties = {
    display: full ? "flex" : "inline-flex", width: full ? "100%" : "auto",
    alignItems: "center", justifyContent: "center", gap: s.gap,
    height: s.h, padding: `0 ${s.px}px`,
    fontFamily: "var(--font-sans)", fontSize: s.fs, fontWeight: 600, lineHeight: 1,
    letterSpacing: "-0.005em", whiteSpace: "nowrap",
    color: disabled ? "var(--action-disabled-fg)" : t.fg,
    background: disabled ? "var(--action-disabled-bg)" : press ? t.press : hover ? t.hover : t.bg,
    border: `1px solid ${disabled ? "transparent" : t.bd}`,
    borderRadius: pill ? "var(--radius-pill)" : "var(--radius-sm)",
    boxShadow: disabled || !hover || variant === "ghost" ? (variant === "secondary" ? "var(--shadow-1)" : "none") : t.shadow,
    cursor: disabled ? "not-allowed" : "pointer",
    transform: press && !disabled ? "scale(var(--press-scale))" : "none",
    transition: "background var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),transform var(--dur-instant) var(--ease-out)",
  };
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{ ...base, ...style }}
      {...rest}
    >
      {iconLeft ? <Icon name={iconLeft} size={s.icon} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={s.icon} /> : null}
    </button>
  );
}
