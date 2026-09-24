"use client";

import type { CSSProperties, ReactNode } from "react";

// Ported from design-system/source/components/forms/Radio.jsx. Tokens only.
// `checked` is fully controlled by the parent: nothing is checked until the parent
// sets it, so a match-walk rate group renders with NO default selection
// (spec 0009 AC-5). `boxed` is the tap-target option card used in the walk.

interface RadioProps {
  label: ReactNode;
  description?: ReactNode;
  name?: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  boxed?: boolean;
  style?: CSSProperties;
}

export function Radio({
  label, description, name, value, checked = false, onChange, disabled = false, boxed = false, style,
}: RadioProps) {
  const on = checked;
  const wrap: CSSProperties = {
    display: "flex", gap: 11, alignItems: description ? "flex-start" : "center",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    ...(boxed
      ? {
          padding: "14px 16px", borderRadius: "var(--radius-md)",
          border: `1px solid ${on ? "var(--clay-500)" : "var(--border-hairline)"}`,
          background: on ? "var(--clay-100)" : "var(--bg-surface)",
          transition: "background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)",
        }
      : null),
    ...style,
  };
  return (
    <label onClick={() => !disabled && onChange && onChange(value)} style={wrap}>
      <span
        style={{
          width: 20, height: 20, flex: "none", borderRadius: "50%", marginTop: description ? 2 : 0,
          border: `1px solid ${on ? "var(--clay-500)" : "var(--border-hairline)"}`,
          background: "var(--bg-surface)", display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <span
          style={{
            width: 10, height: 10, borderRadius: "50%", background: on ? "var(--clay-500)" : "transparent",
            transition: "transform var(--dur-fast) var(--ease-spring)", transform: on ? "scale(1)" : "scale(0)",
          }}
        />
      </span>
      <span>
        <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-strong)", fontWeight: boxed ? 600 : 400 }}>{label}</span>
        {description ? (
          <span style={{ display: "block", fontSize: "var(--body-s-size)", color: "var(--text-muted)", marginTop: 2 }}>{description}</span>
        ) : null}
      </span>
      <input type="radio" name={name} value={value} checked={on} readOnly style={{ display: "none" }} />
    </label>
  );
}
