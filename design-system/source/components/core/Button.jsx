import React from "react";
import { Icon } from "./Icon.jsx";

const sizes = {
  sm: { h: "var(--control-h-sm)", px: 14, fs: "var(--body-s-size)", gap: 6, icon: 15 },
  md: { h: "var(--control-h)", px: 18, fs: "var(--body-m-size)", gap: 8, icon: 17 },
  lg: { h: "var(--control-h-lg)", px: 24, fs: "var(--body-l-size)", gap: 9, icon: 19 }
};

const tones = {
  primary: { bg: "var(--action-primary-bg)", fg: "var(--action-primary-fg)", bd: "transparent", hover: "var(--action-primary-hover)", press: "var(--action-primary-press)", shadow: "var(--shadow-pop)" },
  secondary: { bg: "var(--action-secondary-bg)", fg: "var(--action-secondary-fg)", bd: "var(--border-hairline)", hover: "var(--bg-sunk)", press: "var(--paper-deep)", shadow: "var(--shadow-1)" },
  ghost: { bg: "transparent", fg: "var(--text-body)", bd: "transparent", hover: "var(--action-ghost-hover)", press: "var(--paper-deep)", shadow: "none" },
  inverse: { bg: "var(--paper)", fg: "var(--ink)", bd: "transparent", hover: "#FFFFFF", press: "var(--paper-deep)", shadow: "none" },
  pop: { bg: "var(--apricot-500)", fg: "var(--ink)", bd: "transparent", hover: "var(--apricot-400)", press: "var(--apricot-600)", shadow: "var(--shadow-1)" }
};

export function Button({ children, variant = "primary", size = "md", iconLeft, iconRight, full = false, disabled = false, pill = true, style, ...rest }) {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);
  const s = sizes[size] || sizes.md;
  const t = tones[variant] || tones.primary;
  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setP(false); }}
      onMouseDown={() => setP(true)} onMouseUp={() => setP(false)}
      style={{
        display: full ? "flex" : "inline-flex", width: full ? "100%" : "auto",
        alignItems: "center", justifyContent: "center", gap: s.gap,
        height: s.h, padding: "0 " + s.px + "px",
        fontFamily: "var(--font-sans)", fontSize: s.fs, fontWeight: 600, lineHeight: 1,
        letterSpacing: "-0.005em", whiteSpace: "nowrap",
        color: disabled ? "var(--action-disabled-fg)" : t.fg,
        background: disabled ? "var(--action-disabled-bg)" : (p ? t.press : h ? t.hover : t.bg),
        border: "1px solid " + (disabled ? "transparent" : t.bd),
        borderRadius: pill ? "var(--radius-pill)" : "var(--radius-sm)",
        boxShadow: disabled || !h || variant === "ghost" ? (variant === "secondary" ? "var(--shadow-1)" : "none") : t.shadow,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: p && !disabled ? "scale(var(--press-scale))" : "none",
        transition: "background var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),transform var(--dur-instant) var(--ease-out)",
        ...style
      }}
      {...rest}
    >
      {iconLeft ? <Icon name={iconLeft} size={s.icon} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={s.icon} /> : null}
    </button>
  );
}
