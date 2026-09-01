import React from "react";

export function BuddyAvatar({ size = 30, tone = "clay", style, ...rest }) {
  const bg = tone === "ink" ? "var(--ink)" : tone === "apricot" ? "var(--apricot-500)" : "var(--clay-500)";
  const fg = tone === "apricot" ? "var(--ink)" : "var(--paper)";
  return <span aria-hidden="true" style={{
    width: size, height: size, flex: "none", borderRadius: "50%", background: bg, color: fg,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-display)", fontSize: size * 0.56, lineHeight: 1, paddingBottom: size * 0.04, ...style
  }} {...rest}>F</span>;
}
