import React from "react";
import { IconButton } from "../core/IconButton.jsx";

export function Dialog({ open = true, title, children, footer, onClose, width = 480, style, ...rest }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--backdrop)", backdropFilter: "var(--blur-veil)", animation: "fb-fade var(--dur-base) var(--ease-out) both", zIndex: 40 }} onClick={onClose}>
      <div role="dialog" onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: "100%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-3)", padding: "var(--pad-card-lg)",
        animation: "fb-rise var(--dur-slow) var(--ease-spring) both", ...style
      }} {...rest}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--display-4-size)", lineHeight: 1.15, letterSpacing: "-0.015em", color: "var(--text-strong)", margin: 0 }}>{title}</h3>
          {onClose ? <IconButton name="x" label="Close" onClick={onClose} /> : null}
        </div>
        <div style={{ fontSize: "var(--body-m-size)", lineHeight: 1.65, color: "var(--text-body)" }}>{children}</div>
        {footer ? <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>{footer}</div> : null}
      </div>
    </div>
  );
}
