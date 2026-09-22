import React from "react";
import { Icon } from "../core/Icon.jsx";

export function ChatComposer({ placeholder = "Ask Fin anything about your money", suggestions = [], value, onChange, onSend, onSuggestion, style, ...rest }) {
  const [inner, setInner] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const v = value === undefined ? inner : value;
  const set = (s) => { if (value === undefined) setInner(s); onChange && onChange(s); };
  const send = () => { if (!v.trim()) return; onSend && onSend(v); set(""); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, ...style }} {...rest}>
      {suggestions.length ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => (onSuggestion ? onSuggestion(s) : set(s))} style={{
              border: "1px solid var(--border-hairline)", background: "var(--bg-surface)",
              borderRadius: "var(--radius-pill)", padding: "7px 14px",
              fontSize: "var(--body-s-size)", color: "var(--text-body)", cursor: "pointer",
              transition: "background var(--dur-fast) var(--ease-out)"
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-sunk)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}>{s}</button>
          ))}
        </div>
      ) : null}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "7px 7px 7px 18px",
        background: "var(--bg-surface)", borderRadius: "var(--radius-pill)",
        border: "1px solid " + (focus ? "var(--clay-500)" : "var(--border-hairline)"),
        boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-1)",
        transition: "border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)"
      }}>
        <input value={v} placeholder={placeholder}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: 0, outline: "none", background: "transparent", fontSize: "var(--body-m-size)", height: 34, color: "var(--text-strong)" }} />
        <button aria-label="Send" onClick={send} style={{
          width: 36, height: 36, borderRadius: "50%", border: 0, flex: "none",
          background: v.trim() ? "var(--clay-500)" : "var(--paper-deep)",
          color: v.trim() ? "var(--paper)" : "var(--ink-25)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          transition: "background var(--dur-fast) var(--ease-out)"
        }}><Icon name="arrow-up" size={17} strokeWidth={2.2} /></button>
      </div>
    </div>
  );
}
