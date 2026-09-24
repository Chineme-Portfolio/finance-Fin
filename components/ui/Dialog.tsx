"use client";

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";

// Ported from design-system/source/components/feedback/Dialog.jsx. Tokens only.
// Where a money-affecting choice is confirmed: the person acts, never the app
// (foundation.md §7 #2a). The close control is inlined (the export used IconButton,
// not yet ported). Centred over a blurred ink veil.

interface DialogProps {
  open?: boolean;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  width?: number;
  style?: CSSProperties;
}

export function Dialog({ open = true, title, children, footer, onClose, width = 480, style }: DialogProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, background: "var(--backdrop)", backdropFilter: "var(--blur-veil)",
        animation: "fb-fade var(--dur-base) var(--ease-out) both", zIndex: 40,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: "100%", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-3)", padding: "var(--pad-card-lg)",
          animation: "fb-rise var(--dur-slow) var(--ease-spring) both", ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--display-4-size)", lineHeight: 1.15, letterSpacing: "-0.015em", color: "var(--text-strong)", margin: 0 }}>{title}</h3>
          {onClose ? (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none",
                width: 34, height: 34, borderRadius: "var(--radius-pill)", border: "1px solid var(--border-hairline)",
                background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer",
              }}
            >
              <Icon name="x" size={18} />
            </button>
          ) : null}
        </div>
        <div style={{ fontSize: "var(--body-m-size)", lineHeight: 1.65, color: "var(--text-body)" }}>{children}</div>
        {footer ? <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>{footer}</div> : null}
      </div>
    </div>
  );
}
