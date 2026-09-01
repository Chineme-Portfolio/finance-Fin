# UI kit — FINBUDDY web app

The signed-in product. Responsive web only; there is no native app. Screens are plain classic-script JSX
(no ESM) loaded by `index.html` through Babel and assigned to `window`; they compose primitives from
`window.FINBUDDYDesignSystem_3b7855` and never re-implement them.

| File | Screen | Notes |
| --- | --- | --- |
| `index.html` | Shell + router | TopNav, SideNav rail, toast layer. Opens on Overview — the typical view. |
| `Overview.jsx` | Overview | Hero balance (counts up), 12-month line, unclaimed-match banner, holdings, Fin composer. |
| `MatchWalkthrough.jsx` | Match | Three steps → confirm dialog → `WinMoment`. The product's core job. |
| `AskFin.jsx` | Ask Fin | Chat thread with typing state and canned replies. |
| `Accounts.jsx` | Settings | Linked accounts, notification switches, data-scope card. |
| `LinkAccount.jsx` | Onboarding | Provider choice → sign-in → reading. Runs as a full-page flow over the shell. |
| `data.js` | Fixtures | `window.FB_DATA` — one fictional person, Marisol, at Brightline Foods. |

Click-through: **Link account** (top right) runs onboarding; **Walk me through it** on the match banner runs
the walkthrough to its win moment; suggestion pills on Overview jump into Ask Fin with the question seeded.

Layout rules: page max 1180, gutter 32, rail 236 collapsing below 900px, content column capped at
`--page-max`. Cards are 16px radius except the match banner and dialogs (28px).
