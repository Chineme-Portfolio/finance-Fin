import React from "react";

export function Switch({ label, description, checked, defaultChecked, onChange, disabled, style, ...rest }) {
  const [inner, setInner] = React.useState(!!defaultChecked);
  const on = checked === undefined ? inner : checked;
  const toggle = () => { if (disabled) return; if (checked === undefined) setInner(!on); onChange && onChange(!on); };
  return (
    <label onClick={toggle} style={{ display: "flex", gap: 12, alignItems: description ? "flex-start" : "center", justifyContent: "space-between", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }} {...rest}>
      <span>
        <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-strong)" }}>{label}</span>
        {description ? <span style={{ display: "block", fontSize: "var(--body-s-size)", color: "var(--text-muted)", marginTop: 2, maxWidth: "46ch" }}>{description}</span> : null}
      </span>
      <span style={{
        width: 44, height: 26, flex: "none", borderRadius: "var(--radius-pill)", padding: 3,
        background: on ? "var(--clay-500)" : "var(--paper-deep)",
        display: "inline-flex", alignItems: "center",
        transition: "background var(--dur-base) var(--ease-out)"
      }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--white)", boxShadow: "var(--shadow-1)", transform: on ? "translateX(18px)" : "none", transition: "transform var(--dur-base) var(--ease-spring)" }} />
      </span>
    </label>
  );
}
