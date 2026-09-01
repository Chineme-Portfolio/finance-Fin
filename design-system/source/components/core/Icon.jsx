import React from "react";

const pascal = (n) => String(n).split(/[-_\s]/).filter(Boolean).map(s => s[0].toUpperCase() + s.slice(1)).join("");

/** Thin wrapper around the Lucide UMD build (loaded from CDN by the host page). */
export function Icon({ name, size = 18, strokeWidth = 1.75, color = "currentColor", style, ...rest }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false, tries = 0;
    const paint = () => {
      if (cancelled) return;
      const host = ref.current, L = typeof window !== "undefined" && window.lucide;
      if (!host) return;
      const node = L && L.icons && (L.icons[pascal(name)] || L.icons[name]);
      if (!node) { if (tries++ < 40) requestAnimationFrame(paint); return; }
      let svg = null;
      try { svg = L.createElement(node); } catch (e) { svg = null; }
      if (!svg) return;
      svg.setAttribute("width", size); svg.setAttribute("height", size);
      svg.setAttribute("stroke-width", strokeWidth);
      host.replaceChildren(svg);
    };
    paint();
    return () => { cancelled = true; };
  }, [name, size, strokeWidth]);
  return <span ref={ref} aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flex: "none", color, ...style }} {...rest} />;
}
