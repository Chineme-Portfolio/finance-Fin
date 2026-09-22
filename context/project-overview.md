# FINBUDDY — Project Overview

> **Summary only.** `foundation.md` is the complete, authoritative source. If this file and `foundation.md` ever disagree, **`foundation.md` wins.** This file explains; it never decides.
> Codename `FINBUDDY` is a placeholder until the name is locked.
> **Read this to get oriented in five minutes.** Then read `foundation.md` for the reasoning behind any of it.

---

## What this is

A conversational companion that reads your real investment accounts and translates what you already own into your own dollars.

It is **not** a budgeting app and **not** a portfolio tracker. Budgeting tools assume your problem is spending. Brokerage dashboards assume you already understand what you are looking at. This serves the person in between — someone who already owns things they do not understand.

## The problem

People acquire investment accounts through employment and impulse, not through a plan: a 401k they were auto-enrolled in, a brokerage account where they bought something once. There is infinite finance content available to them and almost nothing about **their own specific accounts**. Nobody has ever explained their own statement to them.

The user's own questions are the product spec:

> *"What does buying this actually mean?"* · *"In 3 months would I even gain remotely an extra dollar?"* · *"Do my earnings compound in this account?"*

All the same shape: **take a thing I own, and explain it in my dollars.**

## Who it's for

Low-to-middle-income earners, roughly 20s–40s, financially motivated but not financially literate. v1 serves exactly one person — the founder — who currently has an unresolved instance of the core problem: *"I don't match and I don't know how to, exactly."*

## The platform

Web only — one responsive web app. No mobile app, no extension, no email. (`foundation.md` §0 — the constraints are 5–15 hrs/week and near-zero budget.)

**Shape: dashboard-first** — you land on your money; Fin is a panel you open (`foundation.md` §7 #17).

## Core flows

| | Flow |
|---|---|
| F1 | Link an account via aggregator |
| F2 | What do I actually own? |
| F3 | The match check — am I capturing my employer match? |
| F4 | The orphaned 401k — options for a plan at a former employer |
| F5 | Ask anything, grounded in real account data |
| F6 | What does this mean for my dollars? — **the core loop** |
| F7 | What can't you see, and why? |
| F8 | **How do I turn the match on?** — the highest-priority flow |

## The end-to-end path

**Link an account → the aggregator fills the database → a pure engine turns rows into typed insights → the model puts them into words.**

Numbers never originate in the model. That is the architecture, not a convention (`architecture.md` §6).

## Key invariants

These are the things that must stay true. Each is load-bearing.

1. **The model never does arithmetic.** Every figure is computed in deterministic code and handed to the LLM to explain.
2. **Every number is traceable** to the inputs that produced it.
3. **Inference is a question, never a claim.** Anything pattern-matched is surfaced for confirmation.
4. **Never infer a negative from missing data.** Detecting a match is high-confidence; detecting its absence is not — it has at least five distinct causes with opposite correct responses.
5. **Explain, don't prescribe.** The employer match may be stated as a dollar consequence. Fund selection, allocation, and rebalancing may not.
6. **Show what you can't see.** A missing capability gets an explanation, never a blank or a zero.
7. **Tenancy is a security boundary.** `user_id` everywhere, RLS from the first migration, even at one user.

## What's in scope

Linking accounts, holdings explanation, the match check and its dollar consequence, the walkthrough to actually change a contribution rate, per-account capability disclosure, grounded conversational Q&A, in-session proactive surfacing.

## What's deliberately cut

Manual entry of accounts or holdings. Budgeting and spending. Buy/sell recommendations of any kind. Trade execution. Goal planning and tax optimization. Native mobile. Multi-user. Push notifications.

These are decisions, not gaps (`foundation.md` §8).

## Success

> You understand what is in your brokerage account, and the tool has walked you from *"I don't know how to match"* to a changed contribution rate.

One person, one real outcome, worth real money. Not users, not retention, not launch.

## The state of play

The foundation converged over four versions. Two of them had their deepest-risk section rewritten by **evidence rather than argument** — most importantly, direct observation confirmed the employer 401k returns balance and transactions but **not** holdings. The product is shaped around that finding rather than assuming past it.

---

> **Summary only.** `foundation.md` is the complete, authoritative source. If they disagree, **foundation wins.**
