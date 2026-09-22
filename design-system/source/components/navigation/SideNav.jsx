import React from "react";
import { Icon } from "../core/Icon.jsx";

export function SideNav({ items = [], active, onSelect, footer, style, ...rest }) {
  return (
    <aside style={{ width: "var(--sidebar-w)", flex: "none", display: "flex", flexDirection: "column", gap: 2, padding: "var(--space-6) var(--space-4)", borderRight: "1px solid var(--border-soft)", ...style }} {...rest}>
      {items.map((it) => {
        const label = typeof it === "string" ? it : it.label;
        const on = label === active;
        return (
          <button key={label} onClick={() => onSelect && onSelect(label)} style={{
            display: "flex", alignItems: "center", gap: 11, width: "100%",
            border: 0, background: on ? "var(--paper-deep)" : "transparent",
            borderRadius: "var(--radius-sm)", padding: "10px 12px", cursor: "pointer",
            fontSize: "var(--body-m-size)", fontWeight: on ? 600 : 400, textAlign: "left",
            color: on ? "var(--text-strong)" : "var(--text-muted)",
            transition: "background var(--dur-fast) var(--ease-out)"
          }}>
            {typeof it === "object" && it.icon ? <Icon name={it.icon} size={17} /> : null}
            <span style={{ flex: 1 }}>{label}</span>
            {typeof it === "object" && it.badge ? <span style={{ fontSize: 11, fontWeight: 600, color: "var(--clay-600)", background: "var(--clay-100)", borderRadius: "var(--radius-pill)", padding: "2px 7px" }}>{it.badge}</span> : null}
          </button>
        );
      })}
      {footer ? <div style={{ marginTop: "auto" }}>{footer}</div> : null}
    </aside>
  );
}
