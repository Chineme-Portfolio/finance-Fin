# 0003. "What you own" screen decision record

> The reasoning behind [`index.md`](index.md). Build steps do not read this file; it is here for a human, and for `/architect` if the decision is ever revisited.

## Context

The insight engine (spec 0002) is built and produces typed insights, but nothing renders them. The product's whole promise (`foundation.md` §1) is to show a person their own money in plain words, and until a real screen exists that promise is invisible. This is the first UI, and it carries three decisions bigger than one screen.

First, the app shape. `foundation.md` §12 Q8 asked whether the signed-in product is chat-first (Fin is the app), dashboard-first (you land on your money), or a hybrid. Every screen sits inside that shell, so it could not stay open. The audience (`foundation.md` §2) is defined by not knowing what to ask; a blank chat prompt asks them to already know the question. Dashboard-first leads with what the tool noticed, which is what F6, F7, and F8 are, and it matches the design export's own UI kit. So the shape is settled here, recorded as `foundation.md` §7 #17, and this screen is its first expression.

Second, where the data comes from. There is no database and no login yet (both deliberately deferred, `foundation.md` §7 #4, §7 #10, build order). A first screen whose job is to prove the render should not also stand up auth and a live Plaid session. The committed fixture from spec 0001 is real observed data, synthetic-scrubbed, and it exercises the engine end to end.

Third, and specific to this product, the missing-capability state. `foundation.md` §11 confirmed the FedEx 401k returns a balance but no holdings, and §4 #7 forbids ever rendering that gap as a blank or a zero. This is not an edge case here; it is a defining requirement, and the export never mocked it (`ui-rules.md` §5). The wrinkle: the sandbox fixture's 401k does return holdings, so the fixture alone cannot show the state. The screen must therefore include a representative account that lacks the holdings capability, or the requirement could not be built.

The consequence of not building this now is that the engine stays an abstraction, the design system stays unexercised, and the app shape stays open, blocking every UI slice behind it.

## Options considered

### Option 1: content only, no shell, live data

Render just the holdings content, wired to a live aggregator fetch, in a bare page.

**Pros**:
- Shows the person's real current data, not a fixture.
- Smallest visible surface.

**Cons**:
- Needs a Plaid link every session (the token is in-memory, spec 0001) and burns a Production Item on real accounts, for a screen whose job is to prove the render.
- Defers the app-shape decision, which then blocks the next UI slice anyway.
- Without the shell it does not look like a product, so it proves less than it costs.

### Option 2: Server Component screen over a static view model, dashboard shell (chosen)

Render the committed fixture through the real engine, plus a representative capability-gapped account, in a minimal dashboard-first shell. The data-loading is a seam a live source drops into later.

**Pros**:
- Proves the render, the design system, and the app shape in one slice, with no credentials and no cost.
- Builds the missing-capability state from day one, the product's most distinctive requirement.
- Server Component by default fits the stack (`architecture.md` §2) and keeps the view free of client weight.
- The ported components are reusable by every later screen.

**Cons**:
- Static demo data, not live; the live swap is a later slice.
- The capability-gapped account is scaffolding that must be removed when live data lands.

### Option 3: full app shell plus this screen

Build the whole dashboard shell (every nav destination stubbed) plus the screen.

**Pros**:
- The most complete-feeling result; the whole frame exists.

**Cons**:
- Front-loads a lot of chrome and stub screens before any content is proven, poor value for a solo 10-hour-week build.
- Most of the stubbed destinations depend on features not built (the match, chat), so they would be hollow.

## Rationale

Option 2 is chosen because it proves the three things this slice exists to prove (the render, the design system, the app shape) at the lowest cost and risk, and because it builds the missing-capability state now rather than discovering later that the happy-path screen has no room for it. Option 1's live data is the wrong priority for a first screen and drags in auth and a Plaid session the slice does not need; its lack of a shell also defers the app-shape decision that is blocking other UI work. Option 3 builds too much hollow chrome for a solo build.

The static view model is the honest Facade frame: the screen is real, the data behind it is placeholder, and the seam between them is built so the placeholder swaps out cleanly. The one figure the engine does not produce, a cross-account total, is computed in a pure `lib/` helper rather than in a component, so `foundation.md` §4 #1 (no arithmetic in the view, and none in the model) holds at every layer.

The representative capability-gapped account deserves its own note. It is scaffolding, and scaffolding on a money screen is a risk (a fake account that looks real). It is justified because the state it demonstrates is a hard product requirement that the available fixture cannot show, and it is clearly marked and scheduled for removal when live data lands. The alternative, shipping a first screen that cannot show the missing-capability state, would hide the exact honesty the product is built on.

## References

None. This slice rests on recorded project decisions (`foundation.md` §1, §2, §4 #1, §4 #7, §7 #4, §7 #7, §7 #15, §7 #17, §11; `architecture.md` §2, §4; `code-standards.md` §2, §4) and the committed design system (`ui-tokens.md`, `ui-rules.md`, `ui-registry.md`, `design-system/`). No external sources were needed.
