import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Input({ label, hint, error, prefix, suffix, iconLeft, size = "md", style, wrapStyle, id, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const inputId = id || uid;
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  const border = error ? "var(--data-loss)" : focus ? "var(--clay-500)" : "var(--border-hairline)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, ...wrapStyle }}>
      {label ? <label htmlFor={inputId} style={{ fontSize: "var(--body-s-size)", fontWeight: 600, color: "var(--text-strong)" }}>{label}</label> : null}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, height: h, padding: "0 14px",
        background: "var(--bg-surface)", border: "1px solid " + border, borderRadius: "var(--radius-sm)",
        boxShadow: focus ? "var(--ring-focus)" : "none",
        transition: "border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)"
      }}>
        {iconLeft ? <Icon name={iconLeft} size={16} style={{ color: "var(--text-faint)" }} /> : null}
        {prefix ? <span className="fb-figure" style={{ fontSize: 17, color: "var(--text-faint)" }}>{prefix}</span> : null}
        <input id={inputId} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", fontSize: "var(--body-m-size)", color: "var(--text-strong)", ...style }} {...rest} />
        {suffix ? <span style={{ fontSize: "var(--body-s-size)", color: "var(--text-faint)" }}>{suffix}</span> : null}
      </div>
      {error ? <span style={{ fontSize: "var(--caption-size)", color: "var(--data-loss)" }}>{error}</span>
        : hint ? <span style={{ fontSize: "var(--caption-size)", color: "var(--text-faint)" }}>{hint}</span> : null}
    </div>
  );
}
