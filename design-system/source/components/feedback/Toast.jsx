import React from "react";
import { Icon } from "../core/Icon.jsx";
import { IconButton } from "../core/IconButton.jsx";

const toastTones = { info: ["var(--ink)", "var(--paper)", "info"], success: ["var(--pine-500)", "#EAF3ED", "check"], attention: ["var(--apricot-500)", "var(--ink)", "bell"] };

export function Toast({ children, tone = "info", action, onClose, style, ...rest }) {
  const [bg, fg, icon] = toastTones[tone] || toastTones.info;
  return (
    <div role="status" style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      background: bg, color: fg, borderRadius: "var(--radius-pill)",
      padding: "10px 10px 10px 18px", boxShadow: "var(--shadow-3)",
      fontSize: "var(--body-s-size)", animation: "fb-rise var(--dur-slow) var(--ease-spring) both", ...style
    }} {...rest}>
      <Icon name={icon} size={16} />
      <span style={{ flex: 1 }}>{children}</span>
      {action}
      {onClose ? <IconButton name="x" label="Dismiss" size="sm" onClick={onClose} style={{ color: fg }} /> : null}
    </div>
  );
}
