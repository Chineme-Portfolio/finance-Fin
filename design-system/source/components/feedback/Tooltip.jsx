import React from "react";

export function Tooltip({ children, content, side = "top", style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const pos = side === "bottom" ? { top: "calc(100% + 8px)" } : { bottom: "calc(100% + 8px)" };
  return (
    <span style={{ position: "relative", display: "inline-flex", ...style }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} {...rest}>
      {children}
      {open ? (
        <span role="tooltip" style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)", ...pos,
          background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-sm)",
          padding: "8px 12px", fontSize: "var(--caption-size)", lineHeight: 1.45,
          width: "max-content", maxWidth: 260, boxShadow: "var(--shadow-2)",
          zIndex: 30, pointerEvents: "none", animation: "fb-fade var(--dur-fast) var(--ease-out) both"
        }}>{content}</span>
      ) : null}
    </span>
  );
}
