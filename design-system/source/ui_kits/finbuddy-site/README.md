# UI kit — FINBUDDY marketing site

One page: the homepage. It exists to get a stranger to link one account.

| File | Section | Notes |
| --- | --- | --- |
| `index.html` | Page | Mounts `Home`. |
| `Home.jsx` | Nav, Hero, Steps, MatchBand, Trust, Faq, Footer | All sections in one file; each is exported to `window` separately so a page can recompose them. |

Notes on the design:
- The hero's right side is a real product card built from `Stat`, `AllocationBar` and `HoldingRow` — the site never shows a fake screenshot.
- `MatchBand` is the only inverse section, and it carries a real Fin exchange rather than a testimonial.
- `Trust` is a rounded-rule table, deliberately dull, listing what the product cannot do.
- No photography or illustration is used anywhere. None was supplied with the brief; the page is carried by type and one product card. If brand imagery arrives, the hero and the band above the footer are where it goes.
