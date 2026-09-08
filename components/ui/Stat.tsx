"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

// Ported from design-system/source/components/data/Stat.jsx. The primary way money
// is shown: serif figure (.fb-figure), uppercase label above. 'use client' for the
// count-up hook, which honours prefers-reduced-motion (ui-rules.md §6).
// Note: delta/deltaLabel exist in the design system but are NOT used on the
// "what you own" screen (spec 0003 AC-10: no time-series or per-account delta source).

const fsize: Record<string, string> = {
  xl: "var(--figure-xl-size)", l: "var(--figure-l-size)", m: "var(--figure-m-size)", s: "var(--figure-s-size)",
};

function useCount(target: number, run: boolean): number {
  // Only the animated path uses state. When not animating, we return `target`
  // directly (below), so a prop change is always reflected: a non-animated Stat
  // never shows a stale figure after its value updates (e.g. live data later).
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (reduce || (typeof document !== "undefined" && document.hidden)) {
      const id = requestAnimationFrame(() => setAnimated(target));
      return () => cancelAnimationFrame(id);
    }
    const dur = 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setAnimated(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const settle = setTimeout(() => setAnimated(target), dur + 120);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [target, run]);
  return run ? animated : target;
}

interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  size?: "s" | "m" | "l" | "xl";
  animate?: boolean;
  align?: "left" | "center";
}

export function Stat({
  label, value, prefix = "$", suffix, size = "l", animate = false, align = "left", style, ...rest
}: StatProps) {
  const numeric = typeof value === "number";
  const shown = useCount(numeric ? (value as number) : 0, animate && numeric);
  const text = numeric ? prefix + Math.round(shown).toLocaleString("en-US") : (value as string);
  const wrap: CSSProperties = {
    display: "flex", flexDirection: "column", gap: 6,
    alignItems: align === "center" ? "center" : "flex-start",
  };
  return (
    <div style={{ ...wrap, ...style }} {...rest}>
      {label ? <span className="fb-label">{label}</span> : null}
      <span className="fb-figure" style={{ fontSize: fsize[size] ?? fsize.l, lineHeight: 1.02 }}>
        {text}
        {suffix ? (
          <span style={{ fontSize: "0.42em", fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: 0, color: "var(--text-faint)", marginLeft: 6 }}>
            {suffix}
          </span>
        ) : null}
      </span>
    </div>
  );
}
