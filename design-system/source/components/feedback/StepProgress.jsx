import React from "react";

export function StepProgress({ steps = [], current = 0, style, ...rest }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...style }} {...rest}>
      {steps.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <React.Fragment key={i}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: done ? "var(--clay-300)" : active ? "var(--clay-500)" : "var(--paper-deep)",
                transition: "background var(--dur-base) var(--ease-out)"
              }} />
              <span style={{ fontSize: "var(--caption-size)", fontWeight: active ? 600 : 400, color: active ? "var(--text-strong)" : "var(--text-faint)", whiteSpace: "nowrap" }}>{s}</span>
            </span>
            {i < steps.length - 1 ? <span style={{ flex: 1, height: "var(--rule-thickness)", borderRadius: "var(--radius-pill)", background: done ? "var(--clay-300)" : "var(--border-hairline)" }} /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
