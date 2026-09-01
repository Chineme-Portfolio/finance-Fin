import React from "react";
import { Icon } from "../core/Icon.jsx";

const fsize = { xl: "var(--figure-xl-size)", l: "var(--figure-l-size)", m: "var(--figure-m-size)", s: "var(--figure-s-size)" };

function useCount(target, run) {
  const [n, setN] = React.useState(run ? 0 : target);
  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (!run || reduce || (typeof document !== "undefined" && document.hidden)) { setN(target); return; }
    const dur = 900, t0 = performance.now();
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety net: rAF is throttled or never fires in background tabs, so land the figure regardless.
    const settle = setTimeout(() => setN(target), dur + 120);
    return () => { cancelAnimationFrame(raf); clearTimeout(settle); };
  }, [target, run]);
  return n;
}

export function Stat({ label, value, prefix = "$", suffix, delta, deltaLabel, size = "l", animate = false, align = "left", style, ...rest }) {
  const numeric = typeof value === "number";
  const shown = useCount(numeric ? value : 0, animate && numeric);
  const text = numeric ? prefix + Math.round(shown).toLocaleString("en-US") : value;
  const up = typeof delta === "number" ? delta >= 0 : String(delta || "").trim().charAt(0) !== "-";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: align === "center" ? "center" : "flex-start", ...style }} {...rest}>
      {label ? <span className="fb-label">{label}</span> : null}
      <span className="fb-figure" style={{ fontSize: fsize[size] || fsize.l, lineHeight: 1.02 }}>
        {text}{suffix ? <span style={{ fontSize: "0.42em", fontFamily: "var(--font-sans)", fontWeight: 500, letterSpacing: 0, color: "var(--text-faint)", marginLeft: 6 }}>{suffix}</span> : null}
      </span>
      {delta !== undefined && delta !== null ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--body-s-size)", fontWeight: 600, color: up ? "var(--data-gain)" : "var(--data-loss)" }}>
          <Icon name={up ? "trending-up" : "trending-down"} size={15} />
          {typeof delta === "number" ? (up ? "+" : "") + delta + "%" : delta}
          {deltaLabel ? <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>{deltaLabel}</span> : null}
        </span>
      ) : null}
    </div>
  );
}
