import React from "react";
import { Icon } from "./Icon.jsx";

export function IconButton({ name, label, size = "md", variant = "ghost", disabled = false, style, ...rest }) {
  const [h, setH] = React.useState(false);
  const box = size === "sm" ? 30 : size === "lg" ? 44 : 36;
  const glyph = size === "sm" ? 15 : size === "lg" ? 20 : 18;
  const bg = variant === "solid" ? "var(--ink)" : variant === "tint" ? "var(--bg-tint-warm)" : "transparent";
  const fg = variant === "solid" ? "var(--paper)" : "var(--text-body)";
  return (
    <button aria-label={label} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        width: box, height: box, display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: "var(--radius-pill)", border: variant === "outline" ? "1px solid var(--border-hairline)" : "1px solid transparent",
        background: h && !disabled ? (variant === "solid" ? "#332C25" : "var(--action-ghost-hover)") : bg,
        color: disabled ? "var(--action-disabled-fg)" : fg,
        cursor: disabled ? "not-allowed" : "pointer", flex: "none",
        transition: "background var(--dur-fast) var(--ease-out)", ...style
      }} {...rest}>
      <Icon name={name} size={glyph} />
    </button>
  );
}
