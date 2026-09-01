import React from "react";

export function LineChart({ points = [], width = 520, height = 160, color = "var(--clay-500)", fill = true, showDot = true, style, ...rest }) {
  const uid = React.useId().replace(/:/g, "");
  if (!points.length) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const pad = 8;
  const x = (i) => pad + (i * (width - pad * 2)) / (points.length - 1 || 1);
  const y = (v) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const d = points.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const area = d + " L" + x(points.length - 1).toFixed(1) + " " + (height - pad) + " L" + pad + " " + (height - pad) + " Z";
  return (
    <svg width="100%" viewBox={"0 0 " + width + " " + height} preserveAspectRatio="none" style={{ display: "block", overflow: "visible", ...style }} {...rest}>
      <defs>
        <linearGradient id={"g" + uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={"url(#g" + uid + ")"} /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {showDot ? <circle cx={x(points.length - 1)} cy={y(points[points.length - 1])} r="4.5" fill="var(--bg-surface)" stroke={color} strokeWidth="2.5" /> : null}
    </svg>
  );
}
