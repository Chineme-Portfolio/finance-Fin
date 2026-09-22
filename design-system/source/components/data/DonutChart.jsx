import React from "react";

export function DonutChart({ segments = [], size = 168, thickness = 18, label, value, style, ...rest }) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gapDeg = 2.2;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, ...style }} {...rest}>
      <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--chart-track)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const len = Math.max(0, c * frac - (c * gapDeg) / 360);
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color || "var(--chart-" + ((i % 5) + 1) + ")"} strokeWidth={thickness}
              strokeLinecap="round" strokeDasharray={len + " " + (c - len)}
              strokeDashoffset={-acc * c} />
          );
          acc += frac;
          return el;
        })}
      </svg>
      {(label || value) ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          {value ? <span className="fb-figure" style={{ fontSize: size * 0.19 }}>{value}</span> : null}
          {label ? <span className="fb-label" style={{ fontSize: 10 }}>{label}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
