# 0002. Insight engine — decision record

> The reasoning behind [`index.md`](index.md). Build steps do not read this file; it is here for a human, and for `/architect` if the decision is ever revisited.

## Context

The product's whole value is turning what someone owns into figures they understand, and its most valuable single feature works out whether they are capturing their employer match. `foundation.md` §9 names the deterministic insight engine as the keystone: the thing that, once built, makes everything else a renderer. `architecture.md` §6 makes the same point and adds the reason it must be pure: purity is what lets the match differential, the product's most damaging possible error if wrong (`foundation.md` §7 #16), be unit tested against fixtures instead of hoped about.

Two forces shape this slice specifically. First, `foundation.md` §4 #1 forbids the language model from doing arithmetic: every number must be computed in code and only explained by the model. That makes a deterministic engine not an optimisation but a correctness boundary. Second, the spike (spec 0001) just observed real Plaid response shapes, committed as synthetic fixtures. So the domain model and the mapping into it can be designed against real structure rather than guesses, which is exactly the risk the spike existed to remove.

There is also a hard limit the real data revealed. Plaid's securities data carries no expense ratio or fund fee field. So an insight about what a fund costs per year has no data source, and cannot honestly be built now. What the data does support is composition (what you hold, by kind) and cash (how much is uninvested), because holdings and the cash equivalent flag are present. This is the same "the data decides what is buildable" pattern that has shaped the project from the start.

The consequence of not building this now is that every consumer (chat, UI, the match feature) would either compute its own figures, violating §4 #1, or wait. The engine is the unlock, so it comes before its consumers.

## Options considered

### Option 1: raw shapes into the engine, no separate domain model

The engine accepts Plaid's response objects directly and computes over them. Fewest types to define.

**Pros**:
- Less code up front; no mapping layer, no second set of types.
- Nothing to keep coherent between a domain model and a provider model.

**Cons**:
- The engine would depend on Plaid's shapes, so it could not be pure in any meaningful sense and its tests would need Plaid shaped fixtures forever.
- A provider swap or a revoked connection (`foundation.md` §10) would ripple into the engine, defeating the adapter boundary (`foundation.md` §7 #8).
- It welds the product's core logic to one vendor. Rejected on the boundary alone.

### Option 2: a canonical domain model, mapping in the aggregator, a pure engine over it (chosen)

Define provider neutral domain types in `lib/types/`. The aggregator maps its raw output into them. The engine is pure over the domain model.

**Pros**:
- The engine is genuinely pure and testable with plain fixtures, which is the keystone property (`architecture.md` §6).
- The whole app is decoupled from Plaid; only the aggregator knows the vendor.
- Matches `architecture.md` §3 (types in `lib/types/`), §4 (module boundaries), and `foundation.md` §7 #8 exactly.

**Cons**:
- Two type sets to keep coherent: the provider boundary types in `lib/aggregator/types.ts` and the domain types. Deliberate, but a drift risk (called out in Follow-up).
- More code up front than Option 1.

### Option 3: a separate mapping layer between aggregator and domain

A dedicated `lib/mapping/` module owns the raw to domain translation, keeping the aggregator thin.

**Pros**:
- Cleanest separation on paper: aggregator fetches, mapping translates, engine computes.

**Cons**:
- A third place to look for a solo builder at ten hours a week, when the aggregator already exists precisely to be the provider boundary.
- The mapping needs the provider's raw shapes anyway, so it belongs with the provider code, not in a separate module that would have to import them across a boundary.
- More structure than the project needs now. Reasonable to revisit if the aggregator grows unwieldy.

## Rationale

Option 2 is chosen because purity is the point of the keystone, and only a domain model the engine owns delivers it. `architecture.md` §6 is explicit that the engine must be testable without fixtures shaped like a vendor's API, and Option 1 cannot give that. The mapping goes in the aggregator (not a separate module, Option 3) because the aggregator is already defined as the one place that knows the provider (`foundation.md` §7 #8), and the mapping needs those provider shapes; splitting it out would spread vendor knowledge across two modules for no gain at this size.

The scope, two composition insights and not the match, follows directly from what the spike observed. The match differential depends on seeing whether real employer contributions arrive as paired rows or one blended line, and that observation (spec 0001 task 9) has not happened. Sandbox models securities trades, not payroll, so it cannot stand in. Building the match logic now would mean guessing the shape of the exact data the spike exists to observe, which is the mistake the spike was meant to prevent. So the `Insight` union is designed to accept a match variant later (`index.md` AC-9), and the differential is a follow up gated on task 9.

The expense ratio gap steered insight selection. With no fee data from Plaid, "what does this fund cost" cannot be built honestly, so the slice ships composition and cash drag, which the real data does back. The engineer chose exactly these two, plus deferring fees and contribution activity, which keeps the slice's engine operating on holdings alone: the cleanest possible first cut of the keystone.

## References

None. This slice rests entirely on already recorded project decisions (`foundation.md` §4 #1, §5, §7 #7, §7 #8, §7 #15, §7 #16, §9; `architecture.md` §3, §4, §6; `code-standards.md` §2, §3, §8, §9) and on the real Plaid response shapes observed in spec 0001 and committed to `fixtures/`. No external sources were needed.
