import React from "react";

export function AllocationBar({ segments = [], height = 14, gap = 3, showLegend = false, style, ...rest }) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  return (
    <div style={style} {...rest}>
      <div style={{ display: "flex", gap, height, borderRadius: "var(--radius-pill)", overflow: "hidden", background: "var(--chart-track)" }}>
        {segments.map((s, i) => (
          <div key={i} title={s.label} style={{
            width: (s.value / total) * 100 + "%",
            background: s.color || "var(--chart-" + ((i % 5) + 1) + ")",
            borderRadius: "var(--radius-pill)",
            transition: "width var(--dur-slow) var(--ease-out)"
          }} />
        ))}
      </div>
      {showLegend ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 12 }}>
          {segments.map((s, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color || "var(--chart-" + ((i % 5) + 1) + ")" }} />
              {s.label}
              <span style={{ color: "var(--text-faint)" }}>{Math.round((s.value / total) * 100)}%</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
