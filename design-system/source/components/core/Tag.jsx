import React from "react";
import { Icon } from "./Icon.jsx";

export function Tag({ children, onRemove, selected = false, style, ...rest }) {
  const [h, setH] = React.useState(false);
  return (
    <span onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: onRemove ? "6px 8px 6px 13px" : "6px 13px",
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + (selected ? "var(--clay-500)" : "var(--border-hairline)"),
      background: selected ? "var(--clay-100)" : h ? "var(--bg-sunk)" : "var(--bg-surface)",
      color: selected ? "var(--clay-600)" : "var(--text-body)",
      fontSize: "var(--body-s-size)", fontWeight: 500, cursor: rest.onClick ? "pointer" : "default",
      transition: "background var(--dur-fast) var(--ease-out)", ...style
    }} {...rest}>
      {children}
      {onRemove ? <span onClick={onRemove} style={{ display: "inline-flex", cursor: "pointer", color: "var(--text-faint)" }}><Icon name="x" size={13} /></span> : null}
    </span>
  );
}
