# Component API reference — FINBUDDY

30 components in 6 groups. Each entry below is the component's **props contract** (verbatim from its `.d.ts`) followed by its **usage notes** (verbatim from its `.prompt.md`). Source implementations live in `source/components/<group>/<Name>.jsx`.

These are React function components written as plain classic scripts (no ESM, no build step) so they run in a bare browser. Recreate them in the target codebase's own component idiom — the props contracts and usage notes are the specification; the `.jsx` files are the reference implementation.

---

## core

### Button

```ts
import * as React from "react";
/**
 * FINBUDDY's action control. Pill by default.
 * @startingPoint section="Core" subtitle="Buttons in every variant and size" viewport="700x220"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = clay fill (one per view). pop = apricot, for celebratory/opt-in moments only. */
  variant?: "primary" | "secondary" | "ghost" | "inverse" | "pop";
  size?: "sm" | "md" | "lg";
  /** Lucide icon name rendered before the label. */
  iconLeft?: string;
  iconRight?: string;
  full?: boolean;
  /** Pill radius (default). false gives --radius-sm, used only inside dense toolbars. */
  pill?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
```

One-line: the standard action; use `primary` for the single most important action on a view and `secondary` for everything beside it.

```jsx
<Button variant="primary" iconRight="arrow-right">Walk me through it</Button>
<Button variant="secondary" iconLeft="plus">Link an account</Button>
```

Variants: primary (clay), secondary (white + hairline), ghost, inverse (on ink surfaces), pop (apricot — win moments only). Sizes sm/md/lg. Press shrinks to 0.975.

### IconButton

```ts
import * as React from "react";
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name. */
  name: string;
  /** Required accessible label. */
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "tint" | "solid";
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
```

One-line: a round icon-only control for toolbars, dismiss affordances and row actions.

```jsx
<IconButton name="x" label="Dismiss" />
<IconButton name="settings" label="Settings" variant="outline" />
```

Always circular. `label` is required.

### Card

```ts
import * as React from "react";
/**
 * The system's surface container: 16px radius, warm hairline, low warm shadow.
 * @startingPoint section="Core" subtitle="Surfaces in every tone" viewport="700x260"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "surface" | "sunk" | "tint" | "warm" | "brand" | "inverse";
  /** 0-3. Default 1. */
  elevation?: 0 | 1 | 2 | 3;
  padding?: string | number;
  radius?: string | number;
  /** Lifts 2px and deepens the shadow on hover. */
  interactive?: boolean;
}
export declare function Card(props: CardProps): JSX.Element;
```

One-line: the default surface for grouped content; `inverse` and `brand` tones auto-apply the .fb-inverse token scope so children invert correctly.

```jsx
<Card tone="surface"><h4>Where your money sits</h4></Card>
<Card tone="brand" padding="var(--pad-card-lg)">…</Card>
```

Never stack more than two elevations in one view.

### Rule

```ts
import * as React from "react";
/** The brand's divider: a 2px bar with fully rounded caps. Replaces 1px borders between rows and sections. */
export interface RuleProps extends React.HTMLAttributes<HTMLHRElement> {
  tone?: "hairline" | "strong" | "brand";
  vertical?: boolean;
  /** Pull the rule in from both ends, in px. */
  inset?: number;
}
export declare function Rule(props: RuleProps): JSX.Element;
```

One-line: FINBUDDY's rounded rule — the signature divider; use it instead of a 1px border wherever content is separated.

```jsx
<Rule />
<Rule tone="strong" />
```

`strong` (ink) sits under section headings only, one per screen region.

### Badge

```ts
import * as React from "react";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "brand" | "gain" | "loss" | "attention" | "ink";
  size?: "sm" | "md";
}
export declare function Badge(props: BadgeProps): JSX.Element;
```

One-line: a status pill for account state, gain/loss deltas and "unclaimed" flags.

```jsx
<Badge tone="gain">+4.2%</Badge>
<Badge tone="attention">Unclaimed</Badge>
```

### Tag

```ts
import * as React from "react";
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  /** Renders a dismiss glyph when provided. */
  onRemove?: () => void;
}
export declare function Tag(props: TagProps): JSX.Element;
```

One-line: a filter / choice chip; `selected` fills it with clay tint.

```jsx
<Tag selected>Retirement</Tag>
<Tag onRemove={() => {}}>Single stocks</Tag>
```

### Wordmark

```ts
import * as React from "react";
/** The brand signature. No logo mark exists — FINBUDDY is set in Instrument Serif, uppercase, 0.18em tracking. */
export interface WordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Cap height in px. 16 in app chrome, 22-30 in marketing headers. */
  size?: number;
  tone?: "ink" | "paper" | "clay";
}
export declare function Wordmark(props: WordmarkProps): JSX.Element;
```

One-line: renders the FINBUDDY wordmark; use it anywhere a logo would go — there is no drawn mark.

```jsx
<Wordmark size={18} />
<Wordmark size={26} tone="paper" />
```

Never letterspace tighter than 0.18em, never bold it, never set it in the sans.

### Icon

```ts
import * as React from "react";
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon name, kebab or Pascal ("arrow-right" | "ArrowRight"). */
  name: string;
  /** Pixel box. Default 18. */
  size?: number;
  /** Default 1.75 — FINBUDDY's standard stroke. */
  strokeWidth?: number;
  color?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
```

One-line: renders a Lucide glyph at FINBUDDY's 1.75 stroke weight; the host page must load the Lucide UMD script.

```jsx
<Icon name="arrow-right" size={18} />
```

Sizes in use: 14 (inline with body-s), 18 (buttons, rows), 22 (nav), 28 (empty states). Never recolour to anything but currentColor, --text-faint, or --text-brand.

## forms

### Input

```ts
import * as React from "react";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  /** Replaces hint and turns the field clay-red. */
  error?: string;
  /** Serif currency mark rendered inside the field, e.g. "$". */
  prefix?: string;
  suffix?: string;
  iconLeft?: string;
  size?: "sm" | "md" | "lg";
  wrapStyle?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
```

One-line: the text field; money inputs use `prefix="$"` so the currency mark is set in the serif.

```jsx
<Input label="Contribution" prefix="$" suffix="per paycheck" defaultValue="120" />
```

### Select

```ts
import * as React from "react";
export interface SelectOption { value: string; label: string }
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options?: Array<string | SelectOption>;
  size?: "sm" | "md" | "lg";
  wrapStyle?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
```

One-line: native select with FINBUDDY chrome and a Lucide chevron.

```jsx
<Select label="Account" options={["401(k) — Fidelity","Brokerage — Robinhood"]} />
```

### Checkbox

```ts
import * as React from "react";
export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "onChange"> {
  label: React.ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
```

One-line: multi-select control; pair with `description` when the choice has consequences for someone's money.

```jsx
<Checkbox label="Increase automatically each year" description="By 1% every January, up to 10%." />
```

### Radio

```ts
import * as React from "react";
export interface RadioProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "onChange"> {
  label: React.ReactNode;
  description?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  /** Card-style option: 16px radius, clay tint when selected. Used in onboarding. */
  boxed?: boolean;
}
export declare function Radio(props: RadioProps): JSX.Element;
```

One-line: single-choice control; `boxed` turns it into the tap-target option card used through onboarding and the match walkthrough.

```jsx
<Radio boxed label="6% — the full match" description="You'd take home about $84 less per paycheck." checked onChange={()=>{}} />
```

### Switch

```ts
import * as React from "react";
export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLLabelElement>, "onChange"> {
  label: React.ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}
export declare function Switch(props: SwitchProps): JSX.Element;
```

One-line: an immediate on/off setting (notifications, auto-escalation); label sits left, track right.

```jsx
<Switch label="Nudge me when the match changes" defaultChecked />
```

## data

### Stat

```ts
import * as React from "react";
/**
 * A labelled money figure set in the serif with tabular numerals.
 * @startingPoint section="Data" subtitle="Money figures with deltas" viewport="700x180"
 */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  /** Number counts up when animate is set; a string renders verbatim. */
  value: number | string;
  prefix?: string;
  suffix?: string;
  /** Number renders as a signed percentage; string renders verbatim. */
  delta?: number | string;
  deltaLabel?: string;
  size?: "s" | "m" | "l" | "xl";
  /** Counts from zero on mount (respects prefers-reduced-motion). */
  animate?: boolean;
  align?: "left" | "center";
}
export declare function Stat(props: StatProps): JSX.Element;
```

One-line: the primary way FINBUDDY shows an amount — serif figure, uppercase label above, optional gain/loss delta below.

```jsx
<Stat label="Everything you own" value={8412} size="xl" animate delta={4.2} deltaLabel="this year" />
```

Sizes s/m/l/xl. Gains are pine, losses are deep clay. Set `animate` on the one hero figure of a view, never on a list.

### AllocationBar

```ts
import * as React from "react";
export interface AllocationSegment { label: string; value: number; color?: string }
export interface AllocationBarProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: AllocationSegment[];
  height?: number;
  /** Space between segments; the gap is what makes it read as FINBUDDY and not a progress bar. */
  gap?: number;
  showLegend?: boolean;
}
export declare function AllocationBar(props: AllocationBarProps): JSX.Element;
```

One-line: a split pill showing how a balance divides; segments keep their own pill radius and a 3px gap.

```jsx
<AllocationBar showLegend segments={[{label:"US index",value:5215},{label:"Target date",value:1766}]} />
```

### DonutChart

```ts
import * as React from "react";
export interface DonutSegment { label?: string; value: number; color?: string }
export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  /** Small uppercase caption inside the ring. */
  label?: string;
  /** Serif figure inside the ring. */
  value?: string;
}
export declare function DonutChart(props: DonutChartProps): JSX.Element;
```

One-line: round-capped donut for allocation breakdowns; put the total in the hole.

```jsx
<DonutChart value="$8,412" label="3 accounts" segments={[{value:5215},{value:1766},{value:926},{value:505}]} />
```

### LineChart

```ts
import * as React from "react";
export interface LineChartProps extends React.SVGAttributes<SVGSVGElement> {
  /** Raw values; the chart scales to its own min/max. */
  points: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Soft wash under the line. Default true. */
  fill?: boolean;
  showDot?: boolean;
}
export declare function LineChart(props: LineChartProps): JSX.Element;
```

One-line: balance-over-time line with a soft wash; no axes, no gridlines — the number beside it carries the precision.

```jsx
<LineChart points={[5100,5300,5240,5600,5980,6410]} />
```

### HoldingRow

```ts
import * as React from "react";
export interface HoldingRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Plain-language explanation of what the holding is. */
  sub?: string;
  /** Pre-formatted currency string, e.g. "$5,215". */
  value: string;
  percent?: number;
  /** Signed percentage; pine when up, clay when down. */
  delta?: number;
  /** Dot colour — pass a --chart-N token to match the allocation bar. */
  color?: string;
}
export declare function HoldingRow(props: HoldingRowProps): JSX.Element;
```

One-line: one line item in a holdings list; the `sub` is where the fund's real-world meaning goes.

```jsx
<HoldingRow name="VTSAX" sub="Every public US company, in one fund" value="$5,215" percent={62} delta={4.2} />
```

Separate rows with `<Rule />`, not borders.

## chat

### BuddyAvatar

```ts
import * as React from "react";
/** Fin's stand-in: a serif "F" in a clay circle. There is no illustrated character — this is the whole persona mark. */
export interface BuddyAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  tone?: "clay" | "ink" | "apricot";
}
export declare function BuddyAvatar(props: BuddyAvatarProps): JSX.Element;
```

One-line: the companion's mark, used beside every message Fin sends.

```jsx
<BuddyAvatar size={30} />
```

30px in threads, 22px inline, 44px in empty states. Never replace with an emoji or an illustration.

### BuddyMessage

```ts
import * as React from "react";
/**
 * A message from Fin: avatar left, white bubble with one squared corner.
 * @startingPoint section="Chat" subtitle="Fin's message bubble" viewport="700x200"
 */
export interface BuddyMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders three pulsing dots instead of content. */
  typing?: boolean;
  /** Hide the avatar on consecutive messages from Fin. */
  showAvatar?: boolean;
  /** Actions or a chart slotted under a rule inside the bubble. */
  footer?: React.ReactNode;
}
export declare function BuddyMessage(props: BuddyMessageProps): JSX.Element;
```

One-line: Fin speaking; lead with the answer in bold, then the explanation.

```jsx
<BuddyMessage footer={<Button size="sm">Show me</Button>}>
  <b>It means the match is yours to keep.</b> Your own contributions are always yours…
</BuddyMessage>
```

### UserMessage

```ts
import * as React from "react";
/** The person's own message: sand-filled bubble, right aligned, lowercase copy left exactly as typed. */
export interface UserMessageProps extends React.HTMLAttributes<HTMLDivElement> {}
export declare function UserMessage(props: UserMessageProps): JSX.Element;
```

One-line: what the person said; never clean up their capitalisation in mocks — real questions arrive as "what does vested mean".

```jsx
<UserMessage>what does vested mean</UserMessage>
```

### ChatComposer

```ts
import * as React from "react";
export interface ChatComposerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  placeholder?: string;
  /** Suggested questions shown as pills above the field. */
  suggestions?: string[];
  value?: string;
  onChange?: (next: string) => void;
  onSend?: (text: string) => void;
  onSuggestion?: (text: string) => void;
}
export declare function ChatComposer(props: ChatComposerProps): JSX.Element;
```

One-line: the pill-shaped ask field, pinned to the bottom of any Fin surface; suggestion pills sit directly above it.

```jsx
<ChatComposer suggestions={["Am I leaving money on the table?","What is a 401(k) match?"]} onSend={fn} />
```

## feedback

### Dialog

```ts
import * as React from "react";
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  /** Set in the serif, sentence case, phrased as a plain question or statement. */
  title: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  width?: number;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
```

One-line: a centred 28px-radius modal over a blurred ink veil; positions absolutely, so give the parent `position:relative`.

```jsx
<Dialog title="Change your contribution?" footer={<><Button variant="ghost">Not yet</Button><Button>Confirm 6%</Button></>}>…</Dialog>
```

### Toast

```ts
import * as React from "react";
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "success" | "attention";
  action?: React.ReactNode;
  onClose?: () => void;
}
export declare function Toast(props: ToastProps): JSX.Element;
```

One-line: a pill-shaped confirmation that slides up bottom-centre; one at a time, auto-dismiss after ~5s.

```jsx
<Toast tone="success" onClose={fn}>Contribution updated to 6%.</Toast>
```

### Tooltip

```ts
import * as React from "react";
export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Plain-language definition. Keep to one sentence — anything longer belongs in a Fin message. */
  content: React.ReactNode;
  side?: "top" | "bottom";
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
```

One-line: defines a piece of jargon on hover; wraps the dotted-underlined term itself.

```jsx
<Tooltip content="The share of your pay you put in each period."><span>contribution rate</span></Tooltip>
```

### StepProgress

```ts
import * as React from "react";
export interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short verb-led labels, e.g. ["Link", "Check", "Choose", "Done"]. */
  steps: string[];
  /** Zero-based index of the active step. */
  current?: number;
}
export declare function StepProgress(props: StepProgressProps): JSX.Element;
```

One-line: horizontal dots-and-rules progress for onboarding and the match walkthrough; connectors are rounded rules.

```jsx
<StepProgress steps={["Link","Check","Choose","Done"]} current={1} />
```

### WinMoment

```ts
import * as React from "react";
/**
 * The celebration surface: ink panel, apricot glyph, serif figure. Reserved for money actually secured.
 * @startingPoint section="Feedback" subtitle="Milestone celebration panel" viewport="700x300"
 */
export interface WinMomentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase eyebrow, e.g. "Claimed". */
  headline?: string;
  /** The amount, pre-formatted. */
  value?: string;
  action?: React.ReactNode;
}
export declare function WinMoment(props: WinMomentProps): JSX.Element;
```

One-line: marks a real win — match claimed, first account linked, contribution raised; never for a page view or a signup.

```jsx
<WinMoment headline="Claimed" value="$1,240 a year" action={<Button variant="pop">See what changes</Button>}>
  That is your employer's money, and it is now coming to you.
</WinMoment>
```

Maximum one per session. No confetti animation beyond the pop-in.

## navigation

### TopNav

```ts
import * as React from "react";
export interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: string[];
  active?: string;
  onSelect?: (item: string) => void;
  /** Right-hand slot; defaults to a settings IconButton. */
  right?: React.ReactNode;
  tone?: "paper" | "ink";
}
export declare function TopNav(props: TopNavProps): JSX.Element;
```

One-line: the app's 64px header — wordmark, pill nav items, one right-hand action.

```jsx
<TopNav items={["Overview","What you own","Match","Ask Fin"]} active="Overview" onSelect={fn} />
```

### Tabs

```ts
import * as React from "react";
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: string[];
  active?: string;
  onSelect?: (item: string) => void;
}
export declare function Tabs(props: TabsProps): JSX.Element;
```

One-line: in-page section switch; the active tab carries a 2px clay underline.

```jsx
<Tabs items={["Holdings","Accounts","History"]} active="Holdings" onSelect={fn} />
```

### SideNav

```ts
import * as React from "react";
export interface SideNavItem { label: string; icon?: string; badge?: string | number }
export interface SideNavProps extends React.HTMLAttributes<HTMLElement> {
  items: Array<string | SideNavItem>;
  active?: string;
  onSelect?: (label: string) => void;
  footer?: React.ReactNode;
}
export declare function SideNav(props: SideNavProps): JSX.Element;
```

One-line: the 236px app rail used on wide viewports; collapses to TopNav below 900px.

```jsx
<SideNav active="Overview" items={[{label:"Overview",icon:"home"},{label:"Match",icon:"gift",badge:"1"}]} />
```
