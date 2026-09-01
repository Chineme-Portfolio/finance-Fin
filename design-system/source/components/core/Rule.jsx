import React from "react";

export function Rule({ tone = "hairline", vertical = false, inset = 0, style, ...rest }) {
  const color = tone === "strong" ? "var(--rule-strong-color)" : tone === "brand" ? "var(--clay-500)" : "var(--rule-color)";
  return <hr aria-hidden="true" style={{
    border: 0, margin: 0, borderRadius: "var(--radius-pill)", background: color,
    ...(vertical
      ? { width: "var(--rule-thickness)", alignSelf: "stretch", marginTop: inset, marginBottom: inset }
      : { height: "var(--rule-thickness)", width: "auto", marginLeft: inset, marginRight: inset }),
    ...style
  }} {...rest} />;
}
