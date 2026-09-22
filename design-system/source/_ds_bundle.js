/* @ds-bundle: {"format":4,"namespace":"FINBUDDYDesignSystem_3b7855","components":[{"name":"BuddyAvatar","sourcePath":"components/chat/BuddyAvatar.jsx"},{"name":"BuddyMessage","sourcePath":"components/chat/BuddyMessage.jsx"},{"name":"ChatComposer","sourcePath":"components/chat/ChatComposer.jsx"},{"name":"UserMessage","sourcePath":"components/chat/UserMessage.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Rule","sourcePath":"components/core/Rule.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Wordmark","sourcePath":"components/core/Wordmark.jsx"},{"name":"AllocationBar","sourcePath":"components/data/AllocationBar.jsx"},{"name":"DonutChart","sourcePath":"components/data/DonutChart.jsx"},{"name":"HoldingRow","sourcePath":"components/data/HoldingRow.jsx"},{"name":"LineChart","sourcePath":"components/data/LineChart.jsx"},{"name":"Stat","sourcePath":"components/data/Stat.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"StepProgress","sourcePath":"components/feedback/StepProgress.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"WinMoment","sourcePath":"components/feedback/WinMoment.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"SideNav","sourcePath":"components/navigation/SideNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopNav","sourcePath":"components/navigation/TopNav.jsx"}],"sourceHashes":{"components/chat/BuddyAvatar.jsx":"99c8d1349f31","components/chat/BuddyMessage.jsx":"c0818a7d55eb","components/chat/ChatComposer.jsx":"e78accbea217","components/chat/UserMessage.jsx":"c097e22efa04","components/core/Badge.jsx":"d95b725cd371","components/core/Button.jsx":"2db66f1a061f","components/core/Card.jsx":"ad2f453232c0","components/core/Icon.jsx":"11d26f2516a2","components/core/IconButton.jsx":"09d6a3b73415","components/core/Rule.jsx":"01042c7c129d","components/core/Tag.jsx":"b14d0bfd2fdf","components/core/Wordmark.jsx":"b20e329c3b15","components/data/AllocationBar.jsx":"248192effdf1","components/data/DonutChart.jsx":"3e02e845497b","components/data/HoldingRow.jsx":"64298332d8e1","components/data/LineChart.jsx":"3deb0f9bfe90","components/data/Stat.jsx":"57536bccadb6","components/feedback/Dialog.jsx":"f04b63be0854","components/feedback/StepProgress.jsx":"f12324668996","components/feedback/Toast.jsx":"c222e03215a8","components/feedback/Tooltip.jsx":"e4ab6dff7fae","components/feedback/WinMoment.jsx":"04b08357e91a","components/forms/Checkbox.jsx":"1ef4201d7769","components/forms/Input.jsx":"b0b20fbe4fc2","components/forms/Radio.jsx":"bf32b2d7fef0","components/forms/Select.jsx":"07112e85e9db","components/forms/Switch.jsx":"a4dcc10daafd","components/navigation/SideNav.jsx":"bb472e17dc8c","components/navigation/Tabs.jsx":"c68cdf743cb1","components/navigation/TopNav.jsx":"aa4bc0a3984d","ui_kits/finbuddy-app/Accounts.jsx":"2091ecee9e3b","ui_kits/finbuddy-app/AskFin.jsx":"c1e863156b05","ui_kits/finbuddy-app/LinkAccount.jsx":"3b6448e46c49","ui_kits/finbuddy-app/MatchWalkthrough.jsx":"ec31a759298d","ui_kits/finbuddy-app/Overview.jsx":"ad8c28d9b620","ui_kits/finbuddy-app/data.js":"fb4e87bd920c","ui_kits/finbuddy-site/Home.jsx":"dc189692d43c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FINBUDDYDesignSystem_3b7855 = window.FINBUDDYDesignSystem_3b7855 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/chat/BuddyAvatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BuddyAvatar({
  size = 30,
  tone = "clay",
  style,
  ...rest
}) {
  const bg = tone === "ink" ? "var(--ink)" : tone === "apricot" ? "var(--apricot-500)" : "var(--clay-500)";
  const fg = tone === "apricot" ? "var(--ink)" : "var(--paper)";
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    style: {
      width: size,
      height: size,
      flex: "none",
      borderRadius: "50%",
      background: bg,
      color: fg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-display)",
      fontSize: size * 0.56,
      lineHeight: 1,
      paddingBottom: size * 0.04,
      ...style
    }
  }, rest), "F");
}
Object.assign(__ds_scope, { BuddyAvatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/BuddyAvatar.jsx", error: String((e && e.message) || e) }); }

// components/chat/BuddyMessage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BuddyMessage({
  children,
  typing = false,
  showAvatar = true,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      gap: 10,
      alignItems: "flex-end",
      animation: "fb-rise var(--dur-slow) var(--ease-out) both",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      flex: "none"
    }
  }, showAvatar ? /*#__PURE__*/React.createElement(__ds_scope.BuddyAvatar, {
    size: 30
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-soft)",
      borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-xs)",
      padding: "14px 18px",
      maxWidth: "58ch",
      boxShadow: "var(--shadow-1)",
      fontSize: "var(--body-m-size)",
      lineHeight: 1.65,
      color: "var(--text-body)"
    }
  }, typing ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 5,
      padding: "3px 0"
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "var(--ink-25)",
      animation: "fb-fade 1s " + i * 0.16 + "s infinite alternate var(--ease-in-out)"
    }
  }))) : children, footer && !typing ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      paddingTop: 12,
      borderTop: "1px solid var(--border-soft)"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { BuddyMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/BuddyMessage.jsx", error: String((e && e.message) || e) }); }

// components/chat/UserMessage.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function UserMessage({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      alignSelf: "flex-end",
      marginLeft: "auto",
      background: "var(--paper-deep)",
      color: "var(--text-strong)",
      borderRadius: "var(--radius-lg) var(--radius-lg) var(--radius-xs) var(--radius-lg)",
      padding: "12px 17px",
      maxWidth: "44ch",
      fontSize: "var(--body-m-size)",
      lineHeight: 1.55,
      animation: "fb-rise var(--dur-base) var(--ease-out) both",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { UserMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/UserMessage.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const badgeTones = {
  neutral: ["var(--bg-sunk)", "var(--text-muted)"],
  brand: ["var(--clay-100)", "var(--clay-600)"],
  gain: ["var(--data-gain-bg)", "var(--data-gain)"],
  loss: ["var(--data-loss-bg)", "var(--data-loss)"],
  attention: ["var(--data-attention-bg)", "var(--apricot-600)"],
  ink: ["var(--ink)", "var(--paper)"]
};
function Badge({
  children,
  tone = "neutral",
  size = "md",
  style,
  ...rest
}) {
  const [bg, fg] = badgeTones[tone] || badgeTones.neutral;
  const sm = size === "sm";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: bg,
      color: fg,
      borderRadius: "var(--radius-pill)",
      padding: sm ? "3px 8px" : "5px 11px",
      fontFamily: "var(--font-sans)",
      fontSize: sm ? 11 : 12.5,
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const toneMap = {
  surface: {
    bg: "var(--bg-surface)",
    bd: "var(--border-soft)",
    fg: "inherit"
  },
  sunk: {
    bg: "var(--bg-sunk)",
    bd: "transparent",
    fg: "inherit"
  },
  tint: {
    bg: "var(--bg-tint)",
    bd: "transparent",
    fg: "inherit"
  },
  warm: {
    bg: "var(--bg-tint-warm)",
    bd: "transparent",
    fg: "inherit"
  },
  brand: {
    bg: "var(--bg-brand)",
    bd: "transparent",
    fg: "var(--text-on-brand)"
  },
  inverse: {
    bg: "var(--ink)",
    bd: "transparent",
    fg: "var(--paper)"
  }
};
function Card({
  children,
  tone = "surface",
  elevation = 1,
  padding = "var(--pad-card)",
  radius = "var(--radius-md)",
  interactive = false,
  className = "",
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const t = toneMap[tone] || toneMap.surface;
  const shadows = ["none", "var(--shadow-1)", "var(--shadow-2)", "var(--shadow-3)"];
  const cls = (tone === "inverse" || tone === "brand" ? "fb-inverse " : "") + className;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls.trim() || undefined,
    onMouseEnter: interactive ? () => setH(true) : undefined,
    onMouseLeave: interactive ? () => setH(false) : undefined,
    style: {
      background: t.bg,
      color: t.fg,
      border: "1px solid " + t.bd,
      borderRadius: radius,
      padding,
      boxShadow: shadows[interactive && h ? Math.min(elevation + 1, 3) : elevation],
      transform: interactive && h ? "translateY(-2px)" : "none",
      transition: "box-shadow var(--dur-base) var(--ease-out),transform var(--dur-base) var(--ease-out)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const pascal = n => String(n).split(/[-_\s]/).filter(Boolean).map(s => s[0].toUpperCase() + s.slice(1)).join("");

/** Thin wrapper around the Lucide UMD build (loaded from CDN by the host page). */
function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  color = "currentColor",
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false,
      tries = 0;
    const paint = () => {
      if (cancelled) return;
      const host = ref.current,
        L = typeof window !== "undefined" && window.lucide;
      if (!host) return;
      const node = L && L.icons && (L.icons[pascal(name)] || L.icons[name]);
      if (!node) {
        if (tries++ < 40) requestAnimationFrame(paint);
        return;
      }
      let svg = null;
      try {
        svg = L.createElement(node);
      } catch (e) {
        svg = null;
      }
      if (!svg) return;
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);
      svg.setAttribute("stroke-width", strokeWidth);
      host.replaceChildren(svg);
    };
    paint();
    return () => {
      cancelled = true;
    };
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: ref,
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      flex: "none",
      color,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/chat/ChatComposer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ChatComposer({
  placeholder = "Ask Fin anything about your money",
  suggestions = [],
  value,
  onChange,
  onSend,
  onSuggestion,
  style,
  ...rest
}) {
  const [inner, setInner] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const v = value === undefined ? inner : value;
  const set = s => {
    if (value === undefined) setInner(s);
    onChange && onChange(s);
  };
  const send = () => {
    if (!v.trim()) return;
    onSend && onSend(v);
    set("");
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      ...style
    }
  }, rest), suggestions.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, suggestions.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => onSuggestion ? onSuggestion(s) : set(s),
    style: {
      border: "1px solid var(--border-hairline)",
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-pill)",
      padding: "7px 14px",
      fontSize: "var(--body-s-size)",
      color: "var(--text-body)",
      cursor: "pointer",
      transition: "background var(--dur-fast) var(--ease-out)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--bg-sunk)",
    onMouseLeave: e => e.currentTarget.style.background = "var(--bg-surface)"
  }, s))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "7px 7px 7px 18px",
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + (focus ? "var(--clay-500)" : "var(--border-hairline)"),
      boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-1)",
      transition: "border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: v,
    placeholder: placeholder,
    onChange: e => set(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") send();
    },
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: "none",
      background: "transparent",
      fontSize: "var(--body-m-size)",
      height: 34,
      color: "var(--text-strong)"
    }
  }), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Send",
    onClick: send,
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      border: 0,
      flex: "none",
      background: v.trim() ? "var(--clay-500)" : "var(--paper-deep)",
      color: v.trim() ? "var(--paper)" : "var(--ink-25)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "background var(--dur-fast) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-up",
    size: 17,
    strokeWidth: 2.2
  }))));
}
Object.assign(__ds_scope, { ChatComposer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chat/ChatComposer.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    h: "var(--control-h-sm)",
    px: 14,
    fs: "var(--body-s-size)",
    gap: 6,
    icon: 15
  },
  md: {
    h: "var(--control-h)",
    px: 18,
    fs: "var(--body-m-size)",
    gap: 8,
    icon: 17
  },
  lg: {
    h: "var(--control-h-lg)",
    px: 24,
    fs: "var(--body-l-size)",
    gap: 9,
    icon: 19
  }
};
const tones = {
  primary: {
    bg: "var(--action-primary-bg)",
    fg: "var(--action-primary-fg)",
    bd: "transparent",
    hover: "var(--action-primary-hover)",
    press: "var(--action-primary-press)",
    shadow: "var(--shadow-pop)"
  },
  secondary: {
    bg: "var(--action-secondary-bg)",
    fg: "var(--action-secondary-fg)",
    bd: "var(--border-hairline)",
    hover: "var(--bg-sunk)",
    press: "var(--paper-deep)",
    shadow: "var(--shadow-1)"
  },
  ghost: {
    bg: "transparent",
    fg: "var(--text-body)",
    bd: "transparent",
    hover: "var(--action-ghost-hover)",
    press: "var(--paper-deep)",
    shadow: "none"
  },
  inverse: {
    bg: "var(--paper)",
    fg: "var(--ink)",
    bd: "transparent",
    hover: "#FFFFFF",
    press: "var(--paper-deep)",
    shadow: "none"
  },
  pop: {
    bg: "var(--apricot-500)",
    fg: "var(--ink)",
    bd: "transparent",
    hover: "var(--apricot-400)",
    press: "var(--apricot-600)",
    shadow: "var(--shadow-1)"
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  full = false,
  disabled = false,
  pill = true,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);
  const s = sizes[size] || sizes.md;
  const t = tones[variant] || tones.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setP(false);
    },
    onMouseDown: () => setP(true),
    onMouseUp: () => setP(false),
    style: {
      display: full ? "flex" : "inline-flex",
      width: full ? "100%" : "auto",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      height: s.h,
      padding: "0 " + s.px + "px",
      fontFamily: "var(--font-sans)",
      fontSize: s.fs,
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "-0.005em",
      whiteSpace: "nowrap",
      color: disabled ? "var(--action-disabled-fg)" : t.fg,
      background: disabled ? "var(--action-disabled-bg)" : p ? t.press : h ? t.hover : t.bg,
      border: "1px solid " + (disabled ? "transparent" : t.bd),
      borderRadius: pill ? "var(--radius-pill)" : "var(--radius-sm)",
      boxShadow: disabled || !h || variant === "ghost" ? variant === "secondary" ? "var(--shadow-1)" : "none" : t.shadow,
      cursor: disabled ? "not-allowed" : "pointer",
      transform: p && !disabled ? "scale(var(--press-scale))" : "none",
      transition: "background var(--dur-fast) var(--ease-out),box-shadow var(--dur-base) var(--ease-out),transform var(--dur-instant) var(--ease-out)",
      ...style
    }
  }, rest), iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: s.icon
  }) : null, children, iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  name,
  label,
  size = "md",
  variant = "ghost",
  disabled = false,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const box = size === "sm" ? 30 : size === "lg" ? 44 : 36;
  const glyph = size === "sm" ? 15 : size === "lg" ? 20 : 18;
  const bg = variant === "solid" ? "var(--ink)" : variant === "tint" ? "var(--bg-tint-warm)" : "transparent";
  const fg = variant === "solid" ? "var(--paper)" : "var(--text-body)";
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    disabled: disabled,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      width: box,
      height: box,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-pill)",
      border: variant === "outline" ? "1px solid var(--border-hairline)" : "1px solid transparent",
      background: h && !disabled ? variant === "solid" ? "#332C25" : "var(--action-ghost-hover)" : bg,
      color: disabled ? "var(--action-disabled-fg)" : fg,
      cursor: disabled ? "not-allowed" : "pointer",
      flex: "none",
      transition: "background var(--dur-fast) var(--ease-out)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: name,
    size: glyph
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Rule.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Rule({
  tone = "hairline",
  vertical = false,
  inset = 0,
  style,
  ...rest
}) {
  const color = tone === "strong" ? "var(--rule-strong-color)" : tone === "brand" ? "var(--clay-500)" : "var(--rule-color)";
  return /*#__PURE__*/React.createElement("hr", _extends({
    "aria-hidden": "true",
    style: {
      border: 0,
      margin: 0,
      borderRadius: "var(--radius-pill)",
      background: color,
      ...(vertical ? {
        width: "var(--rule-thickness)",
        alignSelf: "stretch",
        marginTop: inset,
        marginBottom: inset
      } : {
        height: "var(--rule-thickness)",
        width: "auto",
        marginLeft: inset,
        marginRight: inset
      }),
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Rule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Rule.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  onRemove,
  selected = false,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: onRemove ? "6px 8px 6px 13px" : "6px 13px",
      borderRadius: "var(--radius-pill)",
      border: "1px solid " + (selected ? "var(--clay-500)" : "var(--border-hairline)"),
      background: selected ? "var(--clay-100)" : h ? "var(--bg-sunk)" : "var(--bg-surface)",
      color: selected ? "var(--clay-600)" : "var(--text-body)",
      fontSize: "var(--body-s-size)",
      fontWeight: 500,
      cursor: rest.onClick ? "pointer" : "default",
      transition: "background var(--dur-fast) var(--ease-out)",
      ...style
    }
  }, rest), children, onRemove ? /*#__PURE__*/React.createElement("span", {
    onClick: onRemove,
    style: {
      display: "inline-flex",
      cursor: "pointer",
      color: "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 13
  })) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/Wordmark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Wordmark({
  size = 16,
  tone = "ink",
  style,
  ...rest
}) {
  const color = tone === "paper" ? "var(--paper)" : tone === "clay" ? "var(--clay-500)" : "var(--text-strong)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      fontFamily: "var(--font-display)",
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      fontSize: size,
      lineHeight: 1,
      color,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), "Finbuddy");
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/data/AllocationBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function AllocationBar({
  segments = [],
  height = 14,
  gap = 3,
  showLegend = false,
  style,
  ...rest
}) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap,
      height,
      borderRadius: "var(--radius-pill)",
      overflow: "hidden",
      background: "var(--chart-track)"
    }
  }, segments.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    title: s.label,
    style: {
      width: s.value / total * 100 + "%",
      background: s.color || "var(--chart-" + (i % 5 + 1) + ")",
      borderRadius: "var(--radius-pill)",
      transition: "width var(--dur-slow) var(--ease-out)"
    }
  }))), showLegend ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px 18px",
      marginTop: 12
    }
  }, segments.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: s.color || "var(--chart-" + (i % 5 + 1) + ")"
    }
  }), s.label, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-faint)"
    }
  }, Math.round(s.value / total * 100), "%")))) : null);
}
Object.assign(__ds_scope, { AllocationBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/AllocationBar.jsx", error: String((e && e.message) || e) }); }

// components/data/DonutChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DonutChart({
  segments = [],
  size = 168,
  thickness = 18,
  label,
  value,
  style,
  ...rest
}) {
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gapDeg = 2.2;
  let acc = 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "relative",
      width: size,
      height: size,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 " + size + " " + size,
    style: {
      transform: "rotate(-90deg)"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--chart-track)",
    strokeWidth: thickness
  }), segments.map((s, i) => {
    const frac = s.value / total;
    const len = Math.max(0, c * frac - c * gapDeg / 360);
    const el = /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      stroke: s.color || "var(--chart-" + (i % 5 + 1) + ")",
      strokeWidth: thickness,
      strokeLinecap: "round",
      strokeDasharray: len + " " + (c - len),
      strokeDashoffset: -acc * c
    });
    acc += frac;
    return el;
  })), label || value ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2
    }
  }, value ? /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: size * 0.19
    }
  }, value) : null, label ? /*#__PURE__*/React.createElement("span", {
    className: "fb-label",
    style: {
      fontSize: 10
    }
  }, label) : null) : null);
}
Object.assign(__ds_scope, { DonutChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DonutChart.jsx", error: String((e && e.message) || e) }); }

// components/data/HoldingRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function HoldingRow({
  name,
  sub,
  value,
  percent,
  color,
  delta,
  onClick,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const up = typeof delta === "number" ? delta >= 0 : true;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 12px",
      margin: "0 -12px",
      borderRadius: "var(--radius-sm)",
      background: h && onClick ? "var(--bg-sunk)" : "transparent",
      cursor: onClick ? "pointer" : "default",
      transition: "background var(--dur-fast) var(--ease-out)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: color || "var(--chart-1)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--body-m-size)",
      color: "var(--text-strong)",
      fontWeight: 500,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, name), sub ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--body-s-size)",
      color: "var(--text-faint)",
      marginTop: 1
    }
  }, sub) : null), percent !== undefined ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-faint)",
      width: 42,
      textAlign: "right"
    }
  }, percent, "%") : null, delta !== undefined ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-s-size)",
      fontWeight: 600,
      color: up ? "var(--data-gain)" : "var(--data-loss)",
      width: 58,
      textAlign: "right"
    }
  }, (up ? "+" : "") + delta + "%") : null, /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: "var(--figure-s-size)",
      width: 92,
      textAlign: "right"
    }
  }, value), onClick ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 16,
    style: {
      color: h ? "var(--text-muted)" : "var(--text-faint)"
    }
  }) : null);
}
Object.assign(__ds_scope, { HoldingRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/HoldingRow.jsx", error: String((e && e.message) || e) }); }

// components/data/LineChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function LineChart({
  points = [],
  width = 520,
  height = 160,
  color = "var(--clay-500)",
  fill = true,
  showDot = true,
  style,
  ...rest
}) {
  const uid = React.useId().replace(/:/g, "");
  if (!points.length) return null;
  const min = Math.min(...points),
    max = Math.max(...points);
  const span = max - min || 1;
  const pad = 8;
  const x = i => pad + i * (width - pad * 2) / (points.length - 1 || 1);
  const y = v => pad + (1 - (v - min) / span) * (height - pad * 2);
  const d = points.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const area = d + " L" + x(points.length - 1).toFixed(1) + " " + (height - pad) + " L" + pad + " " + (height - pad) + " Z";
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "100%",
    viewBox: "0 0 " + width + " " + height,
    preserveAspectRatio: "none",
    style: {
      display: "block",
      overflow: "visible",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "g" + uid,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.16"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), fill ? /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#g" + uid + ")"
  }) : null, /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), showDot ? /*#__PURE__*/React.createElement("circle", {
    cx: x(points.length - 1),
    cy: y(points[points.length - 1]),
    r: "4.5",
    fill: "var(--bg-surface)",
    stroke: color,
    strokeWidth: "2.5"
  }) : null);
}
Object.assign(__ds_scope, { LineChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/LineChart.jsx", error: String((e && e.message) || e) }); }

// components/data/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fsize = {
  xl: "var(--figure-xl-size)",
  l: "var(--figure-l-size)",
  m: "var(--figure-m-size)",
  s: "var(--figure-s-size)"
};
function useCount(target, run) {
  const [n, setN] = React.useState(run ? 0 : target);
  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (!run || reduce || typeof document !== "undefined" && document.hidden) {
      setN(target);
      return;
    }
    const dur = 900,
      t0 = performance.now();
    let raf = 0;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety net: rAF is throttled or never fires in background tabs, so land the figure regardless.
    const settle = setTimeout(() => setN(target), dur + 120);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [target, run]);
  return n;
}
function Stat({
  label,
  value,
  prefix = "$",
  suffix,
  delta,
  deltaLabel,
  size = "l",
  animate = false,
  align = "left",
  style,
  ...rest
}) {
  const numeric = typeof value === "number";
  const shown = useCount(numeric ? value : 0, animate && numeric);
  const text = numeric ? prefix + Math.round(shown).toLocaleString("en-US") : value;
  const up = typeof delta === "number" ? delta >= 0 : String(delta || "").trim().charAt(0) !== "-";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      alignItems: align === "center" ? "center" : "flex-start",
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("span", {
    className: "fb-label"
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: fsize[size] || fsize.l,
      lineHeight: 1.02
    }
  }, text, suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "0.42em",
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      letterSpacing: 0,
      color: "var(--text-faint)",
      marginLeft: 6
    }
  }, suffix) : null), delta !== undefined && delta !== null ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: "var(--body-s-size)",
      fontWeight: 600,
      color: up ? "var(--data-gain)" : "var(--data-loss)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: up ? "trending-up" : "trending-down",
    size: 15
  }), typeof delta === "number" ? (up ? "+" : "") + delta + "%" : delta, deltaLabel ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-faint)",
      fontWeight: 400
    }
  }, deltaLabel) : null) : null);
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Stat.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = true,
  title,
  children,
  footer,
  onClose,
  width = 480,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--backdrop)",
      backdropFilter: "var(--blur-veil)",
      animation: "fb-fade var(--dur-base) var(--ease-out) both",
      zIndex: 40
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    onClick: e => e.stopPropagation(),
    style: {
      width,
      maxWidth: "100%",
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-3)",
      padding: "var(--pad-card-lg)",
      animation: "fb-rise var(--dur-slow) var(--ease-spring) both",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--display-4-size)",
      lineHeight: 1.15,
      letterSpacing: "-0.015em",
      color: "var(--text-strong)",
      margin: 0
    }
  }, title), onClose ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    name: "x",
    label: "Close",
    onClick: onClose
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-m-size)",
      lineHeight: 1.65,
      color: "var(--text-body)"
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 24
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StepProgress.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StepProgress({
  steps = [],
  current = 0,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      ...style
    }
  }, rest), steps.map((s, i) => {
    const done = i < current,
      active = i === current;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: done ? "var(--clay-300)" : active ? "var(--clay-500)" : "var(--paper-deep)",
        transition: "background var(--dur-base) var(--ease-out)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--caption-size)",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--text-strong)" : "var(--text-faint)",
        whiteSpace: "nowrap"
      }
    }, s)), i < steps.length - 1 ? /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: "var(--rule-thickness)",
        borderRadius: "var(--radius-pill)",
        background: done ? "var(--clay-300)" : "var(--border-hairline)"
      }
    }) : null);
  }));
}
Object.assign(__ds_scope, { StepProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StepProgress.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const toastTones = {
  info: ["var(--ink)", "var(--paper)", "info"],
  success: ["var(--pine-500)", "#EAF3ED", "check"],
  attention: ["var(--apricot-500)", "var(--ink)", "bell"]
};
function Toast({
  children,
  tone = "info",
  action,
  onClose,
  style,
  ...rest
}) {
  const [bg, fg, icon] = toastTones[tone] || toastTones.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      background: bg,
      color: fg,
      borderRadius: "var(--radius-pill)",
      padding: "10px 10px 10px 18px",
      boxShadow: "var(--shadow-3)",
      fontSize: "var(--body-s-size)",
      animation: "fb-rise var(--dur-slow) var(--ease-spring) both",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), action, onClose ? /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    name: "x",
    label: "Dismiss",
    size: "sm",
    onClick: onClose,
    style: {
      color: fg
    }
  }) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  children,
  content,
  side = "top",
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const pos = side === "bottom" ? {
    top: "calc(100% + 8px)"
  } : {
    bottom: "calc(100% + 8px)"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, rest), children, open ? /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      ...pos,
      background: "var(--ink)",
      color: "var(--paper)",
      borderRadius: "var(--radius-sm)",
      padding: "8px 12px",
      fontSize: "var(--caption-size)",
      lineHeight: 1.45,
      width: "max-content",
      maxWidth: 260,
      boxShadow: "var(--shadow-2)",
      zIndex: 30,
      pointerEvents: "none",
      animation: "fb-fade var(--dur-fast) var(--ease-out) both"
    }
  }, content) : null);
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/WinMoment.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function WinMoment({
  headline,
  value,
  children,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "fb-inverse",
    style: {
      position: "relative",
      overflow: "hidden",
      background: "var(--ink)",
      color: "var(--paper)",
      borderRadius: "var(--radius-xl)",
      padding: "var(--pad-card-lg)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      alignItems: "center",
      textAlign: "center",
      animation: "fb-pop var(--dur-slow) var(--ease-spring) both",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 46,
      height: 46,
      borderRadius: "50%",
      background: "var(--apricot-500)",
      color: "var(--ink)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "party-popper",
    size: 22,
    strokeWidth: 2
  })), headline ? /*#__PURE__*/React.createElement("span", {
    className: "fb-label",
    style: {
      color: "var(--apricot-400)"
    }
  }, headline) : null, value ? /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: "var(--figure-l-size)",
      color: "var(--paper)"
    }
  }, value) : null, children ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-m-size)",
      lineHeight: 1.6,
      color: "#D9CEC2",
      maxWidth: "40ch"
    }
  }, children) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, action) : null);
}
Object.assign(__ds_scope, { WinMoment });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/WinMoment.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
  style,
  ...rest
}) {
  const [inner, setInner] = React.useState(!!defaultChecked);
  const on = checked === undefined ? inner : checked;
  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInner(!on);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", _extends({
    onClick: toggle,
    style: {
      display: "flex",
      gap: 11,
      alignItems: description ? "flex-start" : "center",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flex: "none",
      borderRadius: "var(--radius-xs)",
      border: "1px solid " + (on ? "var(--clay-500)" : "var(--border-hairline)"),
      background: on ? "var(--clay-500)" : "var(--bg-surface)",
      color: "var(--paper)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: description ? 2 : 0,
      transition: "background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)"
    }
  }, on ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    strokeWidth: 2.6
  }) : null), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-strong)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, description) : null));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  prefix,
  suffix,
  iconLeft,
  size = "md",
  style,
  wrapStyle,
  id,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const inputId = id || uid;
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  const border = error ? "var(--data-loss)" : focus ? "var(--clay-500)" : "var(--border-hairline)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      ...wrapStyle
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontSize: "var(--body-s-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: h,
      padding: "0 14px",
      background: "var(--bg-surface)",
      border: "1px solid " + border,
      borderRadius: "var(--radius-sm)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      transition: "border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)"
    }
  }, iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 16,
    style: {
      color: "var(--text-faint)"
    }
  }) : null, prefix ? /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: 17,
      color: "var(--text-faint)"
    }
  }, prefix) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: "none",
      background: "transparent",
      fontSize: "var(--body-m-size)",
      color: "var(--text-strong)",
      ...style
    }
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-faint)"
    }
  }, suffix) : null), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--caption-size)",
      color: "var(--data-loss)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--caption-size)",
      color: "var(--text-faint)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  description,
  name,
  value,
  checked,
  onChange,
  disabled,
  boxed = false,
  style,
  ...rest
}) {
  const on = !!checked;
  return /*#__PURE__*/React.createElement("label", _extends({
    onClick: () => !disabled && onChange && onChange(value),
    style: {
      display: "flex",
      gap: 11,
      alignItems: description ? "flex-start" : "center",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...(boxed ? {
        padding: "14px 16px",
        borderRadius: "var(--radius-md)",
        border: "1px solid " + (on ? "var(--clay-500)" : "var(--border-hairline)"),
        background: on ? "var(--clay-100)" : "var(--bg-surface)",
        transition: "background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)"
      } : null),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flex: "none",
      borderRadius: "50%",
      marginTop: description ? 2 : 0,
      border: "1px solid " + (on ? "var(--clay-500)" : "var(--border-hairline)"),
      background: "var(--bg-surface)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: on ? "var(--clay-500)" : "transparent",
      transition: "transform var(--dur-fast) var(--ease-spring)",
      transform: on ? "scale(1)" : "scale(0)"
    }
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-strong)",
      fontWeight: boxed ? 600 : 400
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, description) : null), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: value,
    checked: on,
    readOnly: true,
    style: {
      display: "none"
    }
  }));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  options = [],
  size = "md",
  style,
  wrapStyle,
  id,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const sid = id || uid;
  const h = size === "sm" ? "var(--control-h-sm)" : size === "lg" ? "var(--control-h-lg)" : "var(--control-h)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      ...wrapStyle
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: sid,
    style: {
      fontSize: "var(--body-s-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: sid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: "none",
      width: "100%",
      height: h,
      padding: "0 38px 0 14px",
      background: "var(--bg-surface)",
      border: "1px solid " + (focus ? "var(--clay-500)" : "var(--border-hairline)"),
      borderRadius: "var(--radius-sm)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      fontSize: "var(--body-m-size)",
      color: "var(--text-strong)",
      outline: "none",
      cursor: "pointer",
      ...style
    }
  }, rest), options.map(o => {
    const v = typeof o === "string" ? o : o.value;
    const l = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 13,
      pointerEvents: "none",
      color: "var(--text-faint)",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16
  }))), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--caption-size)",
      color: "var(--text-faint)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled,
  style,
  ...rest
}) {
  const [inner, setInner] = React.useState(!!defaultChecked);
  const on = checked === undefined ? inner : checked;
  const toggle = () => {
    if (disabled) return;
    if (checked === undefined) setInner(!on);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", _extends({
    onClick: toggle,
    style: {
      display: "flex",
      gap: 12,
      alignItems: description ? "flex-start" : "center",
      justifyContent: "space-between",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-strong)"
    }
  }, label), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)",
      marginTop: 2,
      maxWidth: "46ch"
    }
  }, description) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 26,
      flex: "none",
      borderRadius: "var(--radius-pill)",
      padding: 3,
      background: on ? "var(--clay-500)" : "var(--paper-deep)",
      display: "inline-flex",
      alignItems: "center",
      transition: "background var(--dur-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "var(--white)",
      boxShadow: "var(--shadow-1)",
      transform: on ? "translateX(18px)" : "none",
      transition: "transform var(--dur-base) var(--ease-spring)"
    }
  })));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SideNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SideNav({
  items = [],
  active,
  onSelect,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({
    style: {
      width: "var(--sidebar-w)",
      flex: "none",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      padding: "var(--space-6) var(--space-4)",
      borderRight: "1px solid var(--border-soft)",
      ...style
    }
  }, rest), items.map(it => {
    const label = typeof it === "string" ? it : it.label;
    const on = label === active;
    return /*#__PURE__*/React.createElement("button", {
      key: label,
      onClick: () => onSelect && onSelect(label),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        border: 0,
        background: on ? "var(--paper-deep)" : "transparent",
        borderRadius: "var(--radius-sm)",
        padding: "10px 12px",
        cursor: "pointer",
        fontSize: "var(--body-m-size)",
        fontWeight: on ? 600 : 400,
        textAlign: "left",
        color: on ? "var(--text-strong)" : "var(--text-muted)",
        transition: "background var(--dur-fast) var(--ease-out)"
      }
    }, typeof it === "object" && it.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 17
    }) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, label), typeof it === "object" && it.badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: "var(--clay-600)",
        background: "var(--clay-100)",
        borderRadius: "var(--radius-pill)",
        padding: "2px 7px"
      }
    }, it.badge) : null);
  }), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto"
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { SideNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SideNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  active,
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      gap: 24,
      borderBottom: "1px solid var(--border-soft)",
      ...style
    }
  }, rest), items.map(it => {
    const on = it === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it,
      onClick: () => onSelect && onSelect(it),
      style: {
        border: 0,
        background: "transparent",
        padding: "0 0 12px",
        cursor: "pointer",
        fontSize: "var(--body-m-size)",
        fontWeight: on ? 600 : 500,
        color: on ? "var(--text-strong)" : "var(--text-muted)",
        boxShadow: on ? "inset 0 -2px 0 var(--clay-500)" : "none",
        transition: "color var(--dur-fast) var(--ease-out)"
      }
    }, it);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TopNav({
  items = [],
  active,
  onSelect,
  right,
  tone = "paper",
  style,
  ...rest
}) {
  const inverse = tone === "ink";
  return /*#__PURE__*/React.createElement("header", _extends({
    className: inverse ? "fb-inverse" : undefined,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 32,
      height: "var(--topbar-h)",
      padding: "0 var(--page-gutter)",
      background: inverse ? "var(--ink)" : "var(--bg-page)",
      borderBottom: "1px solid " + (inverse ? "#332C25" : "var(--border-soft)"),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Wordmark, {
    size: 17,
    tone: inverse ? "paper" : "ink"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 4,
      flex: 1
    }
  }, items.map(it => {
    const on = it === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it,
      onClick: () => onSelect && onSelect(it),
      style: {
        border: 0,
        background: on ? inverse ? "#2C251E" : "var(--paper-deep)" : "transparent",
        borderRadius: "var(--radius-pill)",
        padding: "8px 15px",
        cursor: "pointer",
        fontSize: "var(--body-s-size)",
        fontWeight: on ? 600 : 500,
        color: on ? "var(--text-strong)" : "var(--text-muted)",
        transition: "background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)"
      }
    }, it);
  })), right !== undefined ? right : /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    name: "settings",
    label: "Settings"
  }));
}
Object.assign(__ds_scope, { TopNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopNav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/finbuddy-app/Accounts.jsx
try { (() => {
const {
  Card,
  Rule,
  Button,
  Badge,
  Switch,
  Icon,
  Tag
} = window.FINBUDDYDesignSystem_3b7855;
function Accounts({
  onLink
}) {
  const d = window.FB_DATA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 820
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "fb-label"
  }, "Settings"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: "var(--display-3-size)",
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)",
      marginTop: 8
    }
  }, "Linked accounts")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconLeft: "plus",
    onClick: onLink
  }, "Link another")), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)"
  }, d.accounts.map((a, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: a.name
  }, i ? /*#__PURE__*/React.createElement(Rule, null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "var(--radius-sm)",
      background: "var(--bg-sunk)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-muted)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.icon,
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--body-m-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, a.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--body-s-size)",
      color: "var(--text-faint)"
    }
  }, a.org)), /*#__PURE__*/React.createElement(Badge, {
    tone: "gain"
  }, "Synced ", a.synced), /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: "var(--figure-s-size)",
      width: 90,
      textAlign: "right"
    }
  }, a.value), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Manage"))))), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--title-m-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "What Fin tells you about"), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "When your employer match changes",
    description: "Plans change their terms more often than people think."
  }), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "When cash has been sitting uninvested for 30 days"
  }), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement(Switch, {
    label: "Monthly summary of what you own",
    description: "First Monday of the month."
  }), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement(Switch, {
    label: "Market drops of more than 5%",
    description: "Off by default. Watching it rarely helps."
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "sunk",
    elevation: 0,
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--title-m-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "Your data"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)",
      maxWidth: "62ch"
    }
  }, "FINBUDDY reads your balances and holdings. It cannot move money, place trades, or change your plan on its own \u2014 every change is one you confirm."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Read-only access"), /*#__PURE__*/React.createElement(Tag, null, "Revoke any time"), /*#__PURE__*/React.createElement(Tag, null, "No data sold"))));
}
Object.assign(window, {
  Accounts
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finbuddy-app/Accounts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/finbuddy-app/AskFin.jsx
try { (() => {
const {
  Card,
  Rule,
  Button,
  BuddyMessage,
  UserMessage,
  ChatComposer,
  BuddyAvatar,
  AllocationBar
} = window.FINBUDDYDesignSystem_3b7855;
const CANNED = {
  "what does vested mean": /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "It means the match is yours to keep."), " Your own contributions are always yours. Brightline's share becomes yours after three years. You are at year two, so about $980 would stay behind if you left tomorrow."),
  "am i too concentrated": /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "A bit, yes."), " 62% of everything you own is in one fund \u2014 though that fund holds every public US company, so it is spread out inside. The riskier part is the $926 in two single stocks."),
  "default": /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Short answer: you own four things."), " One fund holding the whole US market, one target-date fund, two single stocks, and $505 sitting in cash doing nothing. Want me to walk through them one at a time?")
};
function AskFin({
  seed
}) {
  const [thread, setThread] = React.useState(() => [{
    who: "fin",
    body: /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "Morning. Your accounts synced two hours ago."), " Nothing moved much \u2014 you are up $412 this month. Ask me anything about what you own, or about the match you have not claimed.")
  }]);
  const [typing, setTyping] = React.useState(false);
  const endRef = React.useRef(null);
  const ask = React.useCallback(text => {
    setThread(t => [...t, {
      who: "you",
      body: text
    }]);
    setTyping(true);
    setTimeout(() => {
      const key = text.toLowerCase().replace(/[?.!]/g, "").trim();
      setTyping(false);
      setThread(t => [...t, {
        who: "fin",
        body: CANNED[key] || CANNED.default
      }]);
    }, 900);
  }, []);
  React.useEffect(() => {
    if (seed) ask(seed);
  }, [seed, ask]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      minHeight: 560
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(BuddyAvatar, {
    size: 40
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--title-m-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "Fin"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-faint)"
    }
  }, "Reads your accounts. Never sells you anything."))), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      flex: 1
    }
  }, thread.map((m, i) => m.who === "fin" ? /*#__PURE__*/React.createElement(BuddyMessage, {
    key: i
  }, m.body) : /*#__PURE__*/React.createElement(UserMessage, {
    key: i
  }, m.body)), typing ? /*#__PURE__*/React.createElement(BuddyMessage, {
    typing: true
  }) : null, /*#__PURE__*/React.createElement("div", {
    ref: endRef
  })), /*#__PURE__*/React.createElement(ChatComposer, {
    suggestions: ["what does vested mean", "am i too concentrated", "what happens if I quit"],
    onSend: ask,
    onSuggestion: ask
  }));
}
Object.assign(window, {
  AskFin
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finbuddy-app/AskFin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/finbuddy-app/LinkAccount.jsx
try { (() => {
const {
  Card,
  Rule,
  Button,
  Input,
  Radio,
  StepProgress,
  Icon,
  Badge,
  BuddyAvatar,
  Toast
} = window.FINBUDDYDesignSystem_3b7855;
const PROVIDERS = [{
  v: "fidelity",
  t: "Fidelity",
  d: "401(k), 403(b), IRA"
}, {
  v: "robinhood",
  t: "Robinhood",
  d: "Brokerage"
}, {
  v: "vanguard",
  t: "Vanguard",
  d: "IRA, brokerage"
}, {
  v: "empower",
  t: "Empower",
  d: "401(k)"
}];
function LinkAccount({
  onDone,
  onCancel
}) {
  const [step, setStep] = React.useState(0);
  const [provider, setProvider] = React.useState("fidelity");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 520,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(StepProgress, {
    steps: ["Choose", "Sign in", "Reading"],
    current: step
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "fb-label"
  }, "Link an account"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: "var(--display-3-size)",
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)",
      marginTop: 8
    }
  }, step === 0 ? "Who holds it?" : step === 1 ? "Sign in to Fidelity" : "Reading your account"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-muted)",
      marginTop: 10,
      maxWidth: "46ch"
    }
  }, step === 0 ? "Pick the company on your statement. If you only have a login and no idea what it is, pick that one anyway." : step === 1 ? "FINBUDDY gets read-only access. It cannot move money or place trades." : "This takes about twenty seconds. Fin is working out what each holding actually is.")), step === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, PROVIDERS.map(p => /*#__PURE__*/React.createElement(Radio, {
    key: p.v,
    boxed: true,
    label: p.t,
    description: p.d,
    checked: provider === p.v,
    onChange: () => setProvider(p.v)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
    full: true,
    iconRight: "arrow-right",
    onClick: () => setStep(1)
  }, "Continue"))) : null, step === 1 ? /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Username",
    iconLeft: "user",
    placeholder: "marisol.r"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    iconLeft: "lock",
    defaultValue: "passwordish"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 16,
    style: {
      color: "var(--pine-500)"
    }
  }), /*#__PURE__*/React.createElement("span", null, "Read-only. Revoke any time from Settings.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => setStep(0)
  }, "Back"), /*#__PURE__*/React.createElement(Button, {
    full: true,
    onClick: () => {
      setStep(2);
      setTimeout(onDone, 1600);
    }
  }, "Sign in"))) : null, step === 2 ? /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(BuddyAvatar, {
    size: 44
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-body)",
      maxWidth: "34ch"
    }
  }, "Found a 401(k) worth $6,981. Working out what is inside it."), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: "var(--paper-deep)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      borderRadius: "var(--radius-pill)",
      background: "var(--clay-500)",
      width: "70%",
      transition: "width var(--dur-slow) var(--ease-out)"
    }
  }))) : null);
}
Object.assign(window, {
  LinkAccount
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finbuddy-app/LinkAccount.jsx", error: String((e && e.message) || e) }); }

// ui_kits/finbuddy-app/MatchWalkthrough.jsx
try { (() => {
const {
  Card,
  Rule,
  Button,
  Radio,
  Checkbox,
  StepProgress,
  Stat,
  Badge,
  WinMoment,
  Dialog,
  Tooltip,
  Icon
} = window.FINBUDDYDesignSystem_3b7855;
function MatchWalkthrough({
  onDone
}) {
  const m = window.FB_DATA.match;
  const [step, setStep] = React.useState(0);
  const [rate, setRate] = React.useState("6");
  const [escalate, setEscalate] = React.useState(true);
  const [confirm, setConfirm] = React.useState(false);
  const [claimed, setClaimed] = React.useState(false);
  const options = [{
    v: "2",
    t: "2% — what you do now",
    d: "Brightline adds $21 a paycheck. You leave $42 of theirs behind."
  }, {
    v: "4",
    t: "4% — halfway",
    d: "About $42 less in your pocket. Brightline adds $42."
  }, {
    v: "6",
    t: "6% — the full match",
    d: "About $84 less in your pocket. Brightline adds $63. Nothing left behind."
  }];
  if (claimed) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 640,
        margin: "0 auto"
      }
    }, /*#__PURE__*/React.createElement(WinMoment, {
      headline: "Done",
      value: "$1,240 a year",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "pop",
        onClick: onDone
      }, "Back to my money")
    }, "That is Brightline's money, and from your next paycheck it starts coming to you. Nothing else to do."), /*#__PURE__*/React.createElement(Card, {
      padding: "var(--pad-card-lg)",
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "Per paycheck, you",
      value: "$84",
      size: "m",
      prefix: "\u2212$"
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Per paycheck, them",
      value: "$63",
      size: "m",
      prefix: "+$"
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "In a year, together",
      value: "$3,822",
      size: "m"
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 720,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(StepProgress, {
    steps: ["Your plan", "What you'd change", "Confirm"],
    current: step
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "fb-label",
    style: {
      color: "var(--clay-500)"
    }
  }, "Employer match"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: "var(--display-3-size)",
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)",
      marginTop: 10
    }
  }, step === 0 ? "Brightline offers to pay you twice." : step === 1 ? "How much do you want to put in?" : "One last look before it changes.")), step === 0 ? /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-l-size)",
      lineHeight: 1.65,
      color: "var(--text-body)",
      maxWidth: "58ch"
    }
  }, "For every dollar you put into your 401(k), Brightline puts in 50 cents \u2014 up to ", m.full, "% of your pay. That is not a bonus or a perk. It is part of what they agreed to pay you, and you only get it if you ask for it by contributing."), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "You contribute now",
    value: "2%",
    size: "m",
    prefix: ""
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "They will match up to",
    value: "6%",
    size: "m",
    prefix: ""
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Left behind each year",
    value: m.annual,
    size: "m"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 15
  }), /*#__PURE__*/React.createElement("span", null, "Your money is ", /*#__PURE__*/React.createElement(Tooltip, {
    content: "Yours to keep. Brightline's share becomes yours after three years."
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      borderBottom: "1px dotted var(--ink-25)"
    }
  }, "vested")), " at year three. You are at year two.")), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconRight: "arrow-right",
    style: {
      alignSelf: "flex-start"
    },
    onClick: () => setStep(1)
  }, "Show me the options")) : null, step === 1 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, options.map(o => /*#__PURE__*/React.createElement(Radio, {
    key: o.v,
    boxed: true,
    label: o.t,
    description: o.d,
    checked: rate === o.v,
    onChange: () => setRate(o.v)
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "warm",
    elevation: 0,
    padding: 18,
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: escalate,
    onChange: setEscalate,
    label: "Raise it 1% every January",
    description: "Stops at 10%. You can turn this off any time."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => setStep(0)
  }, "Back"), /*#__PURE__*/React.createElement(Button, {
    iconRight: "arrow-right",
    onClick: () => setStep(2)
  }, "Review"))) : null, step === 2 ? /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-body)"
    }
  }, "Contribution"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-faint)",
      textDecoration: "line-through"
    },
    className: "fb-figure"
  }, "2%"), /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: "var(--figure-m-size)"
    }
  }, rate, "%"))), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-body)"
    }
  }, "Your take-home, per paycheck"), /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: "var(--figure-s-size)",
      color: "var(--data-loss)"
    }
  }, "\u2212$84")), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-body)"
    }
  }, "Brightline adds, per paycheck"), /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: "var(--figure-s-size)",
      color: "var(--data-gain)"
    }
  }, "+$63")), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-body)"
    }
  }, "Automatic 1% raise each January"), /*#__PURE__*/React.createElement(Badge, {
    tone: escalate ? "gain" : "neutral"
  }, escalate ? "On" : "Off")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => setStep(1)
  }, "Back"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => setConfirm(true)
  }, "Change it to ", rate, "%"))) : null, /*#__PURE__*/React.createElement(Dialog, {
    open: confirm,
    width: 440,
    title: "Change your contribution to " + rate + "%?",
    onClose: () => setConfirm(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setConfirm(false)
    }, "Not yet"), /*#__PURE__*/React.createElement(Button, {
      onClick: () => {
        setConfirm(false);
        setClaimed(true);
      }
    }, "Yes, change it"))
  }, "This takes effect on your next paycheck, 15 September. You can change it back whenever you want \u2014 it is your plan."));
}
Object.assign(window, {
  MatchWalkthrough
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finbuddy-app/MatchWalkthrough.jsx", error: String((e && e.message) || e) }); }

// ui_kits/finbuddy-app/Overview.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  Card,
  Rule,
  Stat,
  Badge,
  Button,
  AllocationBar,
  HoldingRow,
  LineChart,
  ChatComposer,
  Icon
} = window.FINBUDDYDesignSystem_3b7855;
function MatchBanner({
  onStart
}) {
  const m = window.FB_DATA.match;
  return /*#__PURE__*/React.createElement(Card, {
    tone: "inverse",
    radius: "var(--radius-xl)",
    padding: "var(--pad-card-lg)",
    elevation: 0,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 28,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fb-label",
    style: {
      color: "var(--apricot-400)"
    }
  }, "Unclaimed"), /*#__PURE__*/React.createElement("span", {
    className: "fb-figure",
    style: {
      fontSize: "var(--figure-l-size)",
      color: "var(--paper)"
    }
  }, "$" + m.annual.toLocaleString(), " a year"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#D9CEC2",
      maxWidth: "48ch",
      fontSize: "var(--body-m-size)",
      lineHeight: 1.6
    }
  }, "Brightline adds 50\xA2 for every $1 you put in, up to ", m.full, "% of your pay. You are putting in ", m.rate, "%. The rest of their offer is sitting there.")), /*#__PURE__*/React.createElement(Button, {
    variant: "pop",
    size: "lg",
    iconRight: "arrow-right",
    onClick: onStart
  }, "Walk me through it"));
}
function Overview({
  onStart,
  onAsk
}) {
  const d = window.FB_DATA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "fb-label"
  }, "Wednesday, 1 September"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: "var(--display-2-size)",
      lineHeight: 1.04,
      letterSpacing: "-0.022em",
      color: "var(--text-strong)",
      marginTop: 10,
      maxWidth: "18ch"
    }
  }, "You own $8,412 across three accounts.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "300px 1fr",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Everything you own",
    value: d.total,
    size: "xl",
    animate: true,
    delta: 12.4,
    deltaLabel: "since January"
  }), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)"
    }
  }, "You put in $4,890 of that."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)"
    }
  }, "Your employer put in $1,610."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)"
    }
  }, "The market added $1,912."))), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fb-label"
  }, "Last twelve months"), /*#__PURE__*/React.createElement(Badge, {
    tone: "gain"
  }, "+$1,912")), /*#__PURE__*/React.createElement(LineChart, {
    points: d.history,
    height: 150
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "var(--caption-size)",
      color: "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Sep 2025"), /*#__PURE__*/React.createElement("span", null, "Sep 2026")))), /*#__PURE__*/React.createElement(MatchBanner, {
    onStart: onStart
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--title-m-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "Where your money sits"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconRight: "arrow-right"
  }, "See every holding")), /*#__PURE__*/React.createElement(AllocationBar, {
    showLegend: true,
    segments: d.holdings.map(h => ({
      label: h.name,
      value: h.raw,
      color: h.color
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, d.holdings.map((h, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: h.name
  }, i ? /*#__PURE__*/React.createElement(Rule, null) : null, /*#__PURE__*/React.createElement(HoldingRow, _extends({}, h, {
    onClick: () => {}
  })))))), /*#__PURE__*/React.createElement(Card, {
    tone: "sunk",
    padding: "var(--pad-card-lg)",
    elevation: 0,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "message-circle",
    size: 18,
    style: {
      color: "var(--clay-500)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--title-s-size)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "Anything you want explained?")), /*#__PURE__*/React.createElement(ChatComposer, {
    suggestions: ["What is a target date fund?", "Am I too concentrated?", "What happens if I quit?"],
    onSuggestion: onAsk,
    onSend: onAsk
  })));
}
Object.assign(window, {
  Overview,
  MatchBanner
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finbuddy-app/Overview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/finbuddy-app/data.js
try { (() => {
window.FB_DATA = {
  person: {
    name: "Marisol",
    pay: 2100
  },
  total: 8412,
  history: [5100, 5240, 5180, 5460, 5320, 5810, 6120, 6410, 6380, 6910, 7240, 8412],
  holdings: [{
    name: "VTSAX",
    sub: "Every public US company, in one fund",
    value: "$5,215",
    raw: 5215,
    percent: 62,
    delta: 4.2,
    color: "var(--chart-1)"
  }, {
    name: "Target Date 2055",
    sub: "A fund that adjusts itself as you get older",
    value: "$1,766",
    raw: 1766,
    percent: 21,
    delta: 3.1,
    color: "var(--chart-2)"
  }, {
    name: "Two single stocks",
    sub: "TSLA and NKE — you bought these yourself",
    value: "$926",
    raw: 926,
    percent: 11,
    delta: -8.4,
    color: "var(--chart-3)"
  }, {
    name: "Uninvested cash",
    sub: "Sitting in the account, not buying anything",
    value: "$505",
    raw: 505,
    percent: 6,
    delta: 0,
    color: "var(--chart-4)"
  }],
  accounts: [{
    name: "401(k)",
    org: "Fidelity · through Brightline Foods",
    value: "$6,981",
    icon: "landmark",
    synced: "2 hours ago"
  }, {
    name: "Brokerage",
    org: "Robinhood",
    value: "$926",
    icon: "trending-up",
    synced: "2 hours ago"
  }, {
    name: "Roth IRA",
    org: "Vanguard",
    value: "$505",
    icon: "piggy-bank",
    synced: "Yesterday"
  }],
  match: {
    rate: 2,
    full: 6,
    annual: 1240,
    perCheck: 84,
    employerPerCheck: 63
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finbuddy-app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/finbuddy-site/Home.jsx
try { (() => {
const {
  Button,
  Card,
  Rule,
  Badge,
  Wordmark,
  Icon,
  Stat,
  AllocationBar,
  BuddyMessage,
  UserMessage,
  HoldingRow,
  Tag
} = window.FINBUDDYDesignSystem_3b7855;
function Nav() {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "22px var(--page-gutter)",
      maxWidth: "var(--page-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 19
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 28,
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#how",
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, "How it works"), /*#__PURE__*/React.createElement("a", {
    href: "#match",
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, "The match"), /*#__PURE__*/React.createElement("a", {
    href: "#trust",
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, "What we can see"), /*#__PURE__*/React.createElement("a", {
    href: "#faq",
    style: {
      color: "inherit",
      textDecoration: "none"
    }
  }, "Questions")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
    size: "sm"
  }, "Link an account")));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--page-max)",
      margin: "0 auto",
      padding: "48px var(--page-gutter) 72px",
      display: "grid",
      gridTemplateColumns: "1.05fr .95fr",
      gap: 64,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "fb-label",
    style: {
      color: "var(--clay-500)"
    }
  }, "For people who never got the map"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: 68,
      lineHeight: 1.02,
      letterSpacing: "-0.025em",
      color: "var(--text-strong)",
      margin: "16px 0 20px"
    }
  }, "You already own investments. Do you know what they are?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-l-size)",
      lineHeight: 1.65,
      color: "var(--text-body)",
      maxWidth: "46ch"
    }
  }, "Link the 401(k) you got with a job and the brokerage account you opened on a whim. FINBUDDY reads them and tells you, in your own dollars, what you own and what your employer still owes you."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 30,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconRight: "arrow-right"
  }, "Link an account"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-faint)"
    }
  }, "Free. Read-only. Two minutes."))), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--pad-card-lg)",
    elevation: 2,
    radius: "var(--radius-xl)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Everything you own",
    value: 8412,
    size: "l",
    animate: true
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: "gain"
  }, "+12.4%")), /*#__PURE__*/React.createElement(AllocationBar, {
    showLegend: true,
    segments: [{
      label: "US index",
      value: 5215
    }, {
      label: "Target date",
      value: 1766
    }, {
      label: "Single stocks",
      value: 926
    }, {
      label: "Cash",
      value: 505
    }]
  }), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement(HoldingRow, {
    name: "VTSAX",
    sub: "Every public US company, in one fund",
    value: "$5,215",
    percent: 62
  }), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "var(--ink)",
      borderRadius: "var(--radius-md)",
      padding: "16px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fb-label",
    style: {
      color: "var(--apricot-400)"
    }
  }, "Unclaimed match"), /*#__PURE__*/React.createElement("div", {
    className: "fb-figure",
    style: {
      fontSize: 30,
      color: "var(--paper)",
      marginTop: 4
    }
  }, "$1,240 a year")), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 20,
    style: {
      color: "var(--apricot-400)"
    }
  }))));
}
function Steps() {
  const steps = [{
    n: "01",
    icon: "link",
    t: "Link what you already have",
    d: "Your 401(k), your brokerage account, the IRA you opened once. Read-only, and you can cut it off any time."
  }, {
    n: "02",
    icon: "layers",
    t: "See what you actually own",
    d: "Not tickers. Plain sentences: what each fund holds, how much of your money is in it, and what a bad year would do to it."
  }, {
    n: "03",
    icon: "gift",
    t: "Take the money already yours",
    d: "Most people we meet are leaving employer match behind. Fin works out how much, and walks you through claiming it."
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "how",
    style: {
      maxWidth: "var(--page-max)",
      margin: "0 auto",
      padding: "0 var(--page-gutter) 88px"
    }
  }, /*#__PURE__*/React.createElement("hr", {
    className: "fb-rule",
    style: {
      background: "var(--ink)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 40,
      marginTop: 40
    }
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 42,
      height: 42,
      borderRadius: "50%",
      background: "var(--clay-100)",
      color: "var(--clay-500)",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 19
  })), /*#__PURE__*/React.createElement("span", {
    className: "fb-label"
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: 28,
      lineHeight: 1.15,
      letterSpacing: "-0.015em",
      color: "var(--text-strong)"
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-m-size)",
      lineHeight: 1.65,
      color: "var(--text-muted)"
    }
  }, s.d)))));
}
function MatchBand() {
  return /*#__PURE__*/React.createElement("section", {
    id: "match",
    className: "fb-inverse",
    style: {
      background: "var(--ink)",
      padding: "88px var(--page-gutter)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--page-max)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 72,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "fb-label",
    style: {
      color: "var(--apricot-400)"
    }
  }, "The employer match"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: 50,
      lineHeight: 1.06,
      letterSpacing: "-0.022em",
      color: "var(--paper)",
      margin: "16px 0 20px"
    }
  }, "Your employer offered to pay you twice. Nobody explained the second part."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-l-size)",
      lineHeight: 1.65,
      color: "#D9CEC2",
      maxWidth: "46ch"
    }
  }, "A match is money your employer already agreed to pay you \u2014 you only get it if you contribute enough to trigger it. Miss it and it does not roll over. It is simply gone."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 40,
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fb-figure",
    style: {
      fontSize: 40,
      color: "var(--apricot-500)"
    }
  }, "$1,240"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "#B8ABA0",
      marginTop: 4
    }
  }, "left behind, median user")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "fb-figure",
    style: {
      fontSize: 40,
      color: "var(--paper)"
    }
  }, "7 min"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "#B8ABA0",
      marginTop: 4
    }
  }, "to change it")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(UserMessage, null, "so is the match free money or what"), /*#__PURE__*/React.createElement(BuddyMessage, null, /*#__PURE__*/React.createElement("b", null, "It is money you have already earned."), " Brightline adds 50\xA2 for every $1 you put in, up to 6% of your pay. You are at 2%, so you are collecting a third of it. Moving to 6% costs you about $84 a paycheck and brings in $63 of theirs."), /*#__PURE__*/React.createElement(UserMessage, null, "ok do it"))));
}
function Trust() {
  const rows = [["Balances and holdings", "Yes — that is the whole point"], ["Moving your money", "No. Never. Not even with permission"], ["Placing trades", "No"], ["Selling your data", "No"], ["Recommending products we get paid for", "No — we have none"]];
  return /*#__PURE__*/React.createElement("section", {
    id: "trust",
    style: {
      maxWidth: 900,
      margin: "0 auto",
      padding: "88px var(--page-gutter)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 400,
      fontSize: 40,
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)",
      marginBottom: 8
    }
  }, "What FINBUDDY can and cannot do"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-muted)",
      marginBottom: 28
    }
  }, "You are handing over a view of your money. Here is exactly how far that view goes."), /*#__PURE__*/React.createElement("hr", {
    className: "fb-rule",
    style: {
      background: "var(--ink)"
    }
  }), rows.map(([k, v]) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "16px 0",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-l-size)",
      color: "var(--text-strong)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-m-size)",
      color: "var(--text-muted)",
      textAlign: "right"
    }
  }, v)), /*#__PURE__*/React.createElement("hr", {
    className: "fb-rule"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 24,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Tag, null, "Read-only access"), /*#__PURE__*/React.createElement(Tag, null, "Revoke any time"), /*#__PURE__*/React.createElement(Tag, null, "No affiliate products"), /*#__PURE__*/React.createElement(Tag, null, "No data sold")));
}
function Faq() {
  const qs = [["Does it cost anything?", "No. FINBUDDY is free while we are small. If that changes, you will hear it from us before you see it on a bill."], ["Will it tell me what to buy?", "No. Fin explains what you already own and what your plan offers. Choosing is yours."], ["What if my 401(k) provider is obscure?", "Try it. We cover most plan administrators, and if yours is missing we will tell you straight away rather than half-linking it."], ["I have $300 invested. Is this for me?", "Yes. Especially then — the match is worth more to you than to anyone with a full portfolio."]];
  return /*#__PURE__*/React.createElement("section", {
    id: "faq",
    style: {
      maxWidth: 900,
      margin: "0 auto",
      padding: "0 var(--page-gutter) 88px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "36px 56px"
    }
  }, qs.map(([q, a]) => /*#__PURE__*/React.createElement("div", {
    key: q
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--title-m-size)",
      fontWeight: 600,
      color: "var(--text-strong)",
      marginBottom: 8
    }
  }, q), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-m-size)",
      lineHeight: 1.65,
      color: "var(--text-muted)"
    }
  }, a))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--paper-sunk)",
      padding: "56px var(--page-gutter) 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--page-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Wordmark, {
    size: 19
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)",
      marginTop: 12,
      maxWidth: "30ch"
    }
  }, "Your money, in words you already use.")), [["Product", ["How it works", "The match", "Security"]], ["Learn", ["What is a 401(k)?", "Index funds", "Vesting"]], ["Company", ["About", "Contact", "Terms"]]].map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    className: "fb-label",
    style: {
      marginBottom: 12
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, items.map(i => /*#__PURE__*/React.createElement("a", {
    key: i,
    href: "#",
    style: {
      fontSize: "var(--body-s-size)",
      color: "var(--text-muted)",
      textDecoration: "none"
    }
  }, i)))))), /*#__PURE__*/React.createElement("hr", {
    className: "fb-rule",
    style: {
      margin: "36px 0 20px"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--caption-size)",
      color: "var(--text-faint)",
      maxWidth: "80ch"
    }
  }, "FINBUDDY is not a broker-dealer or an investment adviser. Nothing here is investment advice. Figures shown are illustrative.")));
}
function Home() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Steps, null), /*#__PURE__*/React.createElement(MatchBand, null), /*#__PURE__*/React.createElement(Trust, null), /*#__PURE__*/React.createElement(Faq, null), /*#__PURE__*/React.createElement(Footer, null));
}
Object.assign(window, {
  Home,
  Nav,
  Hero,
  Steps,
  MatchBand,
  Trust,
  Faq,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/finbuddy-site/Home.jsx", error: String((e && e.message) || e) }); }

__ds_ns.BuddyAvatar = __ds_scope.BuddyAvatar;

__ds_ns.BuddyMessage = __ds_scope.BuddyMessage;

__ds_ns.ChatComposer = __ds_scope.ChatComposer;

__ds_ns.UserMessage = __ds_scope.UserMessage;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Rule = __ds_scope.Rule;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.AllocationBar = __ds_scope.AllocationBar;

__ds_ns.DonutChart = __ds_scope.DonutChart;

__ds_ns.HoldingRow = __ds_scope.HoldingRow;

__ds_ns.LineChart = __ds_scope.LineChart;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.StepProgress = __ds_scope.StepProgress;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.WinMoment = __ds_scope.WinMoment;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.SideNav = __ds_scope.SideNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopNav = __ds_scope.TopNav;

})();
