import React from "react";
import { BuddyAvatar } from "./BuddyAvatar.jsx";

export function BuddyMessage({ children, typing = false, showAvatar = true, footer, style, ...rest }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", animation: "fb-rise var(--dur-slow) var(--ease-out) both", ...style }} {...rest}>
      <span style={{ width: 30, flex: "none" }}>{showAvatar ? <BuddyAvatar size={30} /> : null}</span>
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)",
        padding: "14px 18px", maxWidth: "58ch", boxShadow: "var(--shadow-1)",
        fontSize: "var(--body-m-size)", lineHeight: 1.65, color: "var(--text-body)"
      }}>
        {typing ? (
          <span style={{ display: "inline-flex", gap: 5, padding: "3px 0" }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink-25)", animation: "fb-fade 1s " + (i * 0.16) + "s infinite alternate var(--ease-in-out)" }} />)}
          </span>
        ) : children}
        {footer && !typing ? <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-soft)" }}>{footer}</div> : null}
      </div>
    </div>
  );
}
