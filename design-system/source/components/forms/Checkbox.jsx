import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Checkbox({ label, description, checked, defaultChecked, onChange, disabled, style, ...rest }) {
  const [inner, setInner] = React.useState(!!defaultChecked);
  const on = checked === undefined ? inner : checked;
  const toggle = () => { if (disabled) return; if (checked === undefined) setInner(!on); onChange && onChange(!on); };
  return (
    <label onClick={toggle} style={{ display: "flex", gap: 11, alignItems: description ? "flex-start" : "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }} {...rest}>
      <span style={{
        width: 20, height: 20, flex: "none", borderRadius: "var(--radius-xs)",
        border: "1px solid " + (on ? "var(--clay-500)" : "var(--border-hairline)"),
        background: on ? "var(--clay-500)" : "var(--bg-surface)",
        color: "var(--paper)", display: "inline-flex", alignItems: "center", justifyContent: "center",
        marginTop: description ? 2 : 0,
        transition: "background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)"
      }}>{on ? <Icon name="check" size={13} strokeWidth={2.6} /> : null}</span>
      <span>
        <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-strong)" }}>{label}</span>
        {description ? <span style={{ display: "block", fontSize: "var(--body-s-size)", color: "var(--text-muted)", marginTop: 2 }}>{description}</span> : null}
      </span>
    </label>
  );
}
