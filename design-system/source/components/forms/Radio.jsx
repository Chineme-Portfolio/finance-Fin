import React from "react";

export function Radio({ label, description, name, value, checked, onChange, disabled, boxed = false, style, ...rest }) {
  const on = !!checked;
  return (
    <label onClick={() => !disabled && onChange && onChange(value)} style={{
      display: "flex", gap: 11, alignItems: description ? "flex-start" : "center",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      ...(boxed ? {
        padding: "14px 16px", borderRadius: "var(--radius-md)",
        border: "1px solid " + (on ? "var(--clay-500)" : "var(--border-hairline)"),
        background: on ? "var(--clay-100)" : "var(--bg-surface)",
        transition: "background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)"
      } : null), ...style
    }} {...rest}>
      <span style={{
        width: 20, height: 20, flex: "none", borderRadius: "50%", marginTop: description ? 2 : 0,
        border: "1px solid " + (on ? "var(--clay-500)" : "var(--border-hairline)"),
        background: "var(--bg-surface)", display: "inline-flex", alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: on ? "var(--clay-500)" : "transparent", transition: "transform var(--dur-fast) var(--ease-spring)", transform: on ? "scale(1)" : "scale(0)" }} />
      </span>
      <span>
        <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-strong)", fontWeight: boxed ? 600 : 400 }}>{label}</span>
        {description ? <span style={{ display: "block", fontSize: "var(--body-s-size)", color: "var(--text-muted)", marginTop: 2 }}>{description}</span> : null}
      </span>
      <input type="radio" name={name} value={value} checked={on} readOnly style={{ display: "none" }} />
    </label>
  );
}
