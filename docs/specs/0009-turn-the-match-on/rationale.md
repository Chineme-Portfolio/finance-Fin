# 0009. Turn the match on (F8) — rationale

> Decision record for [index.md](index.md). `/develop` skips this file; it is for humans and for `/architect` on a later update.

## Context

F8 is the product's highest priority flow (foundation §3, §6): the walkthrough from "I don't match" to a changed contribution rate. It is the sharpest instance of the whole product, because the founder is living the unresolved problem right now (foundation §2). Everything upstream has been built for it: the domain model, the pure insight engine, persistence, live data, stored contribution deposits, the plan formula library, and F3 the match differential (spec 0008) that reasons over all of it. F8 is the surface that renders F3's differential and walks the user forward.

The forces that shape it are unusually tight, because F8 sits exactly on the product's most sensitive lines:
- It must state a dollar consequence (that is the point, foundation §7 #2a) without ever recommending or setting a rate. The advice line is drawn precisely: the mechanical dollar consequence of a benefit election is allowed; picking the rate, or fund or allocation advice, is not.
- It must never assert an inferred match as fact (foundation §7 #13, #16). The user's own plan formula is unverified (the Northwind catalog entry is `verified: false`), so F8 has to confirm it as a question, not present it as known.
- It must not send the user to a plan document to look anything up (foundation §4 #6); the friction that kills this audience sits right in front of the best feature.
- Its figures cannot come from a language model (foundation §7 #1, #7); a wrong dollar figure is the trust destroying failure the whole architecture exists to prevent.
- It is dashboard first (foundation §7 #17): the Match surface is something the user opens, not the front door.

The design export already anticipated this surface: ui-rules §4 specifies the Match surface as "a three step walk to a WinMoment," with every rate option stating the dollar consequence in take home terms and the change confirmed in a Dialog, and ui-rules §5 gives the inferred and unconfirmed state (a BuddyMessage phrasing the inference as a question). So the shape of F8 was largely settled by the design; the open decisions were about scope, the language model, the content of the guidance, and the honesty of the figures and the celebration.

## Options considered

### Option 1: One coherent F8 flow, templated copy, language model deferred (chosen)

Build the whole Match walk in this slice (persistence, acquisition, the three step walk, the four figures, the Dialog confirm, the projected WinMoment), with the wording rendered as templated copy from structured data, and the language model layer left to F5.

**Pros**:
- Ships the highest priority flow end to end, the loop the founder is waiting for.
- Templated copy keeps the number rule airtight: no language model anywhere near a figure.
- No provider decision or language model boundary to build now; that stays F5's focused job.

**Cons**:
- A large slice: a persistence module, seven component ports, and the walk UI in one spec.
- The phrasing is fixed and less conversational until F5 replaces it.

### Option 2: Split, persistence and quantification first

Spec 0009 builds only the plan facts persistence, the acquisition, and the read path so F3 quantifies end to end (shown minimally); a follow on spec builds the full Match walk and WinMoment.

**Pros**:
- Two smaller, more independently shippable slices.
- The quantification path is proven before the UI investment.

**Cons**:
- The design export treats Match as one surface, so splitting cuts across a coherent flow.
- The founder does not get the flow they are waiting for until the second slice lands.

### Option 3: Split, walk UI first on stub data (a Facade)

Build the Match walk UI and components against placeholder plan facts first, wire real persistence later.

**Pros**:
- The visible flow is up fast, good for feedback on the walk itself.

**Cons**:
- The figures would be fake until wiring lands, and this product's entire value is being correct about real dollars; a walk built on stub numbers risks baking in wrong assumptions about the real ones.

### The language model decision (within Option 1)

Templated copy now versus wiring the language model for F8's wording. Chosen: templated copy. F8's text is structured data (F3's Insight plus the plan facts plus the computed figures); templated React copy renders it faithfully and keeps the language model out of the number path entirely. Wiring the model would mean choosing a provider and building the whole `lib/llm/` boundary, with the number rule needing careful guarding at that boundary, all of which is F5's dedicated job.

### The guidance content decision

Generic in app steps versus a per provider steps library. Chosen: generic in app guidance for this slice. It never sends the user to a document (foundation §4 #6), needs no per provider content to verify and maintain, and is honest if not tailored. A per provider library (like the formula catalog) is a clear follow on once the flow is proven.

### The WinMoment honesty decision

F8 never changes the rate itself; the user does it in their plan site. So the WinMoment (which the design reserves for "money actually secured") fires on a self reported change and is framed as the projected annual match now captured, clearly labelled a projection and not a secured balance (foundation §7 #14). The most honest alternative, holding the WinMoment until a later data sync shows the changed contribution, needs sync diff detection that does not exist yet, so it is a much later upgrade.

### The tax adjusted figure decision

The team chose to show a tax adjusted take home estimate alongside the clean arithmetic figures. This is the one figure that rests on an assumption (a marginal tax rate) and it sits closest to the §8 tax optimization line, which is out of scope. It is kept as a labelled illustration (foundation §7 #14) using a single fixed, visible default rate (`DEFAULT_MARGINAL_RATE_BPS`), rather than a per user tax profile, so it stays as far from tax advice as a take home figure can. The arithmetic still lives in `lib/insights/` like every other figure.

## Rationale

Option 1 wins because F8 is the highest priority flow and its shape is already settled by the design export, so the risk of building it as one coherent slice is low and the payoff (the founder's own unresolved loop, closed) is the whole point of the project (foundation §3). Splitting (Options 2 and 3) trades that payoff for smaller slices, and Option 3 in particular would build the walk on fake figures, which is exactly the wrong risk for a product whose value is being correct about real dollars.

Deferring the language model is the decision that keeps this slice safe and focused: F8's wording is structured data, so templated copy renders it without a provider choice and without ever letting a model touch a figure (foundation §7 #1). That preserves the architecture's core guarantee while still shipping the flow, and it leaves F5 a clean, dedicated job.

The honesty decisions (formula as a question, generic guidance in app, a projected and labelled WinMoment, a labelled tax illustration on a fixed rate) all resolve the same way: state the truth plainly, mark what is inferred or projected, and never let the surface assert more than the engine knows. That is foundation §4 and §7 made visible, and it is what separates this product from the confident, wrong tools its audience already distrusts.

## References

**Project sources** (verifiable, in this repo):
- `context/foundation.md` §2 (the founder's live problem), §3 (F8 is the success bar), §6 (F8 the flow), §7 #2a (the advice line), #4 #6 (never send to a plan document), #7 #13 and #16 (inference is a question), #7 #14 (labelled illustrations), #7 #17 (dashboard first), §8 (tax optimization out of scope).
- `context/ui-rules.md` §2 (a figure is never alone), §3 (apricot for opportunity, no red or green), §4 (the Match surface: a three step walk to a WinMoment), §5 (the inferred and unconfirmed state).
- `context/ui-registry.md` (the components to port: Button, Radio, Input, BuddyMessage, Dialog, StepProgress, WinMoment; the built ones to reuse).
- Spec 0008 (the `match_differential` Insight this renders), spec 0007 (`lib/plans` catalog and `getCatalogEntry`, the match arithmetic in `lib/insights/match.ts`), spec 0004 (the `plan_facts` table and RLS, the deferred auth pattern).
- `supabase/migrations/0001_init.sql` and `0002_rls.sql` (the `plan_facts` shape and its row level security).

**Practices & standards**:
- The advice line: state the mechanical dollar consequence of a benefit election, never pick the security or the rate (foundation §7 #2a).
- Labelled illustrative projection, not a forecast, for any forward or assumption based figure (foundation §7 #14).
- Compute every displayed number in one pure place, never in the view or a template (foundation §4 #1, §7 #7).
