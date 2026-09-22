import type { CSSProperties, HTMLAttributes } from "react";

// Ported from design-system/source/components/core/Rule.jsx. Tokens only.
// The signature rounded divider (ui-tokens.md §4): a 2px bar with rounded caps.

interface RuleProps extends HTMLAttributes<HTMLHRElement> {
  tone?: "hairline" | "strong" | "brand";
  vertical?: boolean;
  inset?: number;
}

export function Rule({ tone = "hairline", vertical = false, inset = 0, style, ...rest }: RuleProps) {
  const color =
    tone === "strong" ? "var(--rule-strong-color)" : tone === "brand" ? "var(--clay-500)" : "var(--rule-color)";
  const orient: CSSProperties = vertical
    ? { width: "var(--rule-thickness)", alignSelf: "stretch", marginTop: inset, marginBottom: inset }
    : { height: "var(--rule-thickness)", width: "auto", marginLeft: inset, marginRight: inset };
  return (
    <hr
      aria-hidden="true"
      style={{ border: 0, margin: 0, borderRadius: "var(--radius-pill)", background: color, ...orient, ...style }}
      {...rest}
    />
  );
}
