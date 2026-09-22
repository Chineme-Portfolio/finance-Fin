import React from "react";
import { Wordmark } from "../core/Wordmark.jsx";
import { IconButton } from "../core/IconButton.jsx";

export function TopNav({ items = [], active, onSelect, right, tone = "paper", style, ...rest }) {
  const inverse = tone === "ink";
  return (
    <header className={inverse ? "fb-inverse" : undefined} style={{
      display: "flex", alignItems: "center", gap: 32, height: "var(--topbar-h)",
      padding: "0 var(--page-gutter)", background: inverse ? "var(--ink)" : "var(--bg-page)",
      borderBottom: "1px solid " + (inverse ? "#332C25" : "var(--border-soft)"), ...style
    }} {...rest}>
      <Wordmark size={17} tone={inverse ? "paper" : "ink"} />
      <nav style={{ display: "flex", gap: 4, flex: 1 }}>
        {items.map((it) => {
          const on = it === active;
          return (
            <button key={it} onClick={() => onSelect && onSelect(it)} style={{
              border: 0, background: on ? (inverse ? "#2C251E" : "var(--paper-deep)") : "transparent",
              borderRadius: "var(--radius-pill)", padding: "8px 15px", cursor: "pointer",
              fontSize: "var(--body-s-size)", fontWeight: on ? 600 : 500,
              color: on ? "var(--text-strong)" : "var(--text-muted)",
              transition: "background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)"
            }}>{it}</button>
          );
        })}
      </nav>
      {right !== undefined ? right : <IconButton name="settings" label="Settings" />}
    </header>
  );
}
