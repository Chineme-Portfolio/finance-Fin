import React from "react";

export function Tabs({ items = [], active, onSelect, style, ...rest }) {
  return (
    <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--border-soft)", ...style }} {...rest}>
      {items.map((it) => {
        const on = it === active;
        return (
          <button key={it} onClick={() => onSelect && onSelect(it)} style={{
            border: 0, background: "transparent", padding: "0 0 12px", cursor: "pointer",
            fontSize: "var(--body-m-size)", fontWeight: on ? 600 : 500,
            color: on ? "var(--text-strong)" : "var(--text-muted)",
            boxShadow: on ? "inset 0 -2px 0 var(--clay-500)" : "none",
            transition: "color var(--dur-fast) var(--ease-out)"
          }}>{it}</button>
        );
      })}
    </div>
  );
}
