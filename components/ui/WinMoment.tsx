import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./Icon";

// Ported from design-system/source/components/feedback/WinMoment.jsx. Tokens only.
// The celebration surface: ink panel, apricot glyph, serif figure. In F8 it shows
// the PROJECTED annual match a reported rate change would capture, clearly labelled
// a projection, not secured money (spec 0009 AC-7, foundation.md §7 #14). Max one
// per session. The `.fb-inverse` scope re-points tokens for the ink panel.

interface WinMomentProps {
  headline?: string;
  value?: string;
  children?: ReactNode;
  action?: ReactNode;
  style?: CSSProperties;
}

export function WinMoment({ headline, value, children, action, style }: WinMomentProps) {
  return (
    <div
      className="fb-inverse"
      style={{
        position: "relative", overflow: "hidden", background: "var(--ink)", color: "var(--paper)",
        borderRadius: "var(--radius-xl)", padding: "var(--pad-card-lg)",
        display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center",
        animation: "fb-pop var(--dur-slow) var(--ease-spring) both", ...style,
      }}
    >
      <span
        style={{
          display: "inline-flex", width: 46, height: 46, borderRadius: "50%", background: "var(--apricot-500)",
          color: "var(--ink)", alignItems: "center", justifyContent: "center", marginBottom: 4,
        }}
      >
        <Icon name="party-popper" size={22} strokeWidth={2} />
      </span>
      {headline ? <span className="fb-label" style={{ color: "var(--apricot-400)" }}>{headline}</span> : null}
      {value ? <span className="fb-figure" style={{ fontSize: "var(--figure-l-size)", color: "var(--paper)" }}>{value}</span> : null}
      {children ? <p style={{ fontSize: "var(--body-m-size)", lineHeight: 1.6, color: "var(--text-muted)", maxWidth: "40ch" }}>{children}</p> : null}
      {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
    </div>
  );
}
