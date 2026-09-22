import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Select({ label, hint, options = [], size = "md", style, wrapStyle, id, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const sid = id || uid;
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, ...wrapStyle }}>
      {label ? <label htmlFor={sid} style={{ fontSize: "var(--body-s-size)", fontWeight: 600, color: "var(--text-strong)" }}>{label}</label> : null}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <select id={sid} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            appearance: "none", width: "100%", height: h, padding: "0 38px 0 14px",
            background: "var(--bg-surface)", border: "1px solid " + (focus ? "var(--clay-500)" : "var(--border-hairline)"),
            borderRadius: "var(--radius-sm)", boxShadow: focus ? "var(--ring-focus)" : "none",
            fontSize: "var(--body-m-size)", color: "var(--text-strong)", outline: "none", cursor: "pointer", ...style
          }} {...rest}>
          {options.map((o) => {
            const v = typeof o === "string" ? o : o.value;
            const l = typeof o === "string" ? o : o.label;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <span style={{ position: "absolute", right: 13, pointerEvents: "none", color: "var(--text-faint)", display: "inline-flex" }}><Icon name="chevron-down" size={16} /></span>
      </div>
      {hint ? <span style={{ fontSize: "var(--caption-size)", color: "var(--text-faint)" }}>{hint}</span> : null}
    </div>
  );
}
