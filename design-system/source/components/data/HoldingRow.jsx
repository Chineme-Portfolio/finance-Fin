import React from "react";
import { Icon } from "../core/Icon.jsx";

export function HoldingRow({ name, sub, value, percent, color, delta, onClick, style, ...rest }) {
  const [h, setH] = React.useState(false);
  const up = typeof delta === "number" ? delta >= 0 : true;
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "14px 12px",
        margin: "0 -12px", borderRadius: "var(--radius-sm)",
        background: h && onClick ? "var(--bg-sunk)" : "transparent",
        cursor: onClick ? "pointer" : "default",
        transition: "background var(--dur-fast) var(--ease-out)", ...style
      }} {...rest}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color || "var(--chart-1)", flex: "none" }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "var(--body-m-size)", color: "var(--text-strong)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
        {sub ? <span style={{ display: "block", fontSize: "var(--body-s-size)", color: "var(--text-faint)", marginTop: 1 }}>{sub}</span> : null}
      </span>
      {percent !== undefined ? <span style={{ fontSize: "var(--body-s-size)", color: "var(--text-faint)", width: 42, textAlign: "right" }}>{percent}%</span> : null}
      {delta !== undefined ? <span style={{ fontSize: "var(--body-s-size)", fontWeight: 600, color: up ? "var(--data-gain)" : "var(--data-loss)", width: 58, textAlign: "right" }}>{(up ? "+" : "") + delta + "%"}</span> : null}
      <span className="fb-figure" style={{ fontSize: "var(--figure-s-size)", width: 92, textAlign: "right" }}>{value}</span>
      {onClick ? <Icon name="chevron-right" size={16} style={{ color: h ? "var(--text-muted)" : "var(--text-faint)" }} /> : null}
    </div>
  );
}
