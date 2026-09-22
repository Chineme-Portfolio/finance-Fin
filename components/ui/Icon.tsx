"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

// Ported from design-system/source/components/core/Icon.jsx.
// 'use client': it reads window.lucide (loaded as a UMD script in the root layout,
// ui-tokens.md §5) and injects an SVG. There is a brief flash before Lucide loads.

interface LucideGlobal {
  icons?: Record<string, unknown>;
  createElement?: (node: unknown) => SVGElement | null;
}

const pascal = (n: string): string =>
  String(n).split(/[-_\s]/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join("");

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function Icon({ name, size = 18, strokeWidth = 1.75, color = "currentColor", style, ...rest }: IconProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const paint = () => {
      if (cancelled) return;
      const host = ref.current;
      const L = (typeof window !== "undefined" ? (window as unknown as { lucide?: LucideGlobal }).lucide : undefined);
      if (!host) return;
      const node = L?.icons?.[pascal(name)] ?? L?.icons?.[name];
      if (!node) {
        if (tries++ < 40) requestAnimationFrame(paint);
        return;
      }
      const svg = L?.createElement?.(node) ?? null;
      if (!svg) return;
      svg.setAttribute("width", String(size));
      svg.setAttribute("height", String(size));
      svg.setAttribute("stroke-width", String(strokeWidth));
      host.replaceChildren(svg);
    };
    paint();
    return () => { cancelled = true; };
  }, [name, size, strokeWidth]);
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: size, height: size, flex: "none", color,
  };
  return <span ref={ref} aria-hidden="true" style={{ ...base, ...style }} {...rest} />;
}
