import { Fragment } from "react";
import type { CSSProperties } from "react";

// Ported from design-system/source/components/feedback/StepProgress.jsx. Tokens only.
// The dots-and-rounded-rules progress for the match walk (ui-rules.md §4).

interface StepProgressProps {
  steps: string[];
  current?: number;
  style?: CSSProperties;
}

export function StepProgress({ steps, current = 0, style }: StepProgressProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...style }}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={i}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: done ? "var(--clay-300)" : active ? "var(--clay-500)" : "var(--paper-deep)",
                  transition: "background var(--dur-base) var(--ease-out)",
                }}
              />
              <span
                style={{
                  fontSize: "var(--caption-size)", fontWeight: active ? 600 : 400,
                  color: active ? "var(--text-strong)" : "var(--text-faint)", whiteSpace: "nowrap",
                }}
              >
                {s}
              </span>
            </span>
            {i < steps.length - 1 ? (
              <span style={{ flex: 1, height: "var(--rule-thickness)", borderRadius: "var(--radius-pill)", background: done ? "var(--clay-300)" : "var(--border-hairline)" }} />
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
