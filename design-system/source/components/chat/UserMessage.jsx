import React from "react";

export function UserMessage({ children, style, ...rest }) {
  return <div style={{
    alignSelf: "flex-end", marginLeft: "auto",
    background: "var(--paper-deep)", color: "var(--text-strong)",
    borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)",
    padding: "12px 17px", maxWidth: "44ch", fontSize: "var(--body-m-size)", lineHeight: 1.55,
    animation: "fb-rise var(--dur-base) var(--ease-out) both", ...style
  }} {...rest}>{children}</div>;
}
