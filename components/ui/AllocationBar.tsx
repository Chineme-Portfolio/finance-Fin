import type { CSSProperties, HTMLAttributes } from "react";

// Ported from design-system/source/components/data/AllocationBar.jsx.
// CHANGED FROM THE REFERENCE (spec 0003 AC-10): the reference computed and showed
// its own rounded percentage (Math.round(value/total*100)). That would be a figure
// computed inside a component, which foundation.md §4 #1 forbids, and could disagree
// with the engine's shareBps. This port shows NO self-computed percentage: the
// legend renders a caller-provided `note` (the engine's shareBps, formatted upstream).
// Segment widths are proportional geometry, fed the engine's shareBps as `value`.

export interface AllocationSegment {
  label: string;
  value: number;
  color?: string;
  note?: string;
}

interface AllocationBarProps extends HTMLAttributes<HTMLDivElement> {
  segments: AllocationSegment[];
  height?: number;
  gap?: number;
  showLegend?: boolean;
}

export function AllocationBar({ segments, height = 14, gap = 3, showLegend = false, style, ...rest }: AllocationBarProps) {
  return (
    <div style={style} {...rest}>
      <div style={{ display: "flex", gap, height, borderRadius: "var(--radius-pill)", overflow: "hidden", background: "var(--chart-track)" }}>
        {segments.map((s, i) => {
          // Proportional sizing via flex-grow (fed the engine's shareBps as value),
          // so the component does no division of its own (spec 0003 AC-10).
          const seg: CSSProperties = {
            flexGrow: s.value,
            flexBasis: 0,
            minWidth: 2,
            background: s.color ?? `var(--chart-${(i % 5) + 1})`,
            borderRadius: "var(--radius-pill)",
          };
          return <div key={s.label} title={s.label} style={seg} />;
        })}
      </div>
      {showLegend ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: 12 }}>
          {segments.map((s, i) => (
            <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color ?? `var(--chart-${(i % 5) + 1})` }} />
              {s.label}
              {s.note ? <span style={{ color: "var(--text-faint)" }}>{s.note}</span> : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
