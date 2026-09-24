"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MatchView, RateOption } from "@/lib/view/match";
import { confirmFormulaAction, savePlanNumbersAction } from "@/app/actions";
import { formatMoney, formatBps } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Radio } from "@/components/ui/Radio";
import { Input } from "@/components/ui/Input";
import { BuddyMessage } from "@/components/ui/BuddyMessage";
import { StepProgress } from "@/components/ui/StepProgress";
import { Dialog } from "@/components/ui/Dialog";
import { WinMoment } from "@/components/ui/WinMoment";

/**
 * The F8 match walk (spec 0009). Renders F3's differential and walks the user from
 * "I don't match" to a changed rate. It computes NO money figure: every amount comes
 * from the view model (which called lib/insights); this component only formats and
 * places them (foundation.md §4 #1, §7 #1). It never sets or recommends a rate
 * (§7 #2a), never asserts an inferred formula (§7 #13), and never sends the user to
 * a plan document (§4 #6).
 */

const STEPS = ["Confirm your match", "See what you're leaving", "Turn it on"];
const NONE_OF_THESE = "__none__";

function frequencyLabel(periodsPerYear: number): string {
  if (periodsPerYear >= 50) return "weekly";
  if (periodsPerYear >= 24 && periodsPerYear <= 27) return "every two weeks";
  if (periodsPerYear >= 22 && periodsPerYear <= 23) return "twice a month";
  if (periodsPerYear >= 11 && periodsPerYear <= 13) return "monthly";
  return `about ${periodsPerYear} times a year`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--gap-section)" }}>
      {children}
    </section>
  );
}

export function MatchWalk({ view }: { view: MatchView }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Step 0 when no formula is recognized yet, else start at "see and choose".
  const initialStep = view.present && view.formulaEntry ? 1 : 0;
  const [step, setStep] = useState(initialStep);
  const [pickedFormula, setPickedFormula] = useState<string | null>(
    view.present && view.formulaEntry ? view.formulaEntry.id : null,
  );
  const [grossPay, setGrossPay] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [freqConfirmed, setFreqConfirmed] = useState(false);
  const [freqRejected, setFreqRejected] = useState(false);
  const [targetBps, setTargetBps] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reported, setReported] = useState(false);

  // Honest empty state: no employer match account, or no differential (AC-1).
  if (!view.present) {
    return (
      <Shell>
        <Card padding="var(--pad-card-lg)">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ color: "var(--text-faint)", flex: "none", marginTop: 2 }}>
              <Icon name="info" size={18} />
            </span>
            <div>
              <h2 style={{ fontSize: "var(--title-l-size)", fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                No employer match to turn on yet
              </h2>
              <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: "var(--body-m-size)", maxWidth: "var(--measure-narrow)" }}>
                We do not see a workplace retirement account with contribution history yet. Once one is linked, this is
                where we help you capture any employer match you are missing.
              </p>
            </div>
          </div>
        </Card>
      </Shell>
    );
  }

  const v = view;
  const provisionalNote = v.formulaProvisional ? (
    <p style={{ marginTop: 10, color: "var(--text-muted)", fontSize: "var(--body-s-size)" }}>
      We have not confirmed this against your plan&rsquo;s own documents, so treat it as a starting point to check, not a
      fact.
    </p>
  ) : null;

  function runAction(fn: () => Promise<{ ok: boolean; message?: string }>, onOk: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        onOk();
        router.refresh();
      } else {
        setError(res.message ?? "Something went wrong. Please try again.");
      }
    });
  }

  // Step 0: confirm the formula as a question, with an explicit escape (AC-2).
  function renderConfirm() {
    const isNone = pickedFormula === NONE_OF_THESE;
    const canConfirm = pickedFormula != null && !isNone;
    return (
      <Card padding="var(--pad-card-lg)">
        <BuddyMessage
          footer={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {v.catalogChoices.map((c) => (
                <Radio
                  key={c.id}
                  boxed
                  name="formula"
                  value={c.id}
                  label={c.label}
                  checked={pickedFormula === c.id}
                  onChange={setPickedFormula}
                />
              ))}
              <Radio
                boxed
                name="formula"
                value={NONE_OF_THESE}
                label="None of these match, or I'm not sure"
                checked={isNone}
                onChange={setPickedFormula}
              />
              {isNone ? (
                <p style={{ color: "var(--text-muted)", fontSize: "var(--body-s-size)" }}>
                  No problem. Without knowing your plan&rsquo;s match, we cannot put a dollar figure on it yet. You can come
                  back once you know the details from your plan.
                </p>
              ) : null}
              <div style={{ marginTop: 4 }}>
                <Button
                  disabled={!canConfirm || isPending}
                  onClick={() =>
                    canConfirm &&
                    runAction(
                      () => confirmFormulaAction(v.accountId, pickedFormula as string),
                      () => setStep(1),
                    )
                  }
                >
                  Yes, that&rsquo;s my match
                </Button>
              </div>
            </div>
          }
        >
          {v.formulaEntry ? (
            <>This looks like a <strong>{v.formulaEntry.label}</strong>. Does that match your plan?{provisionalNote}</>
          ) : (
            <>Which of these looks like your plan&rsquo;s match? Pick the one you recognize, or tell me you are not sure.</>
          )}
        </BuddyMessage>
      </Card>
    );
  }

  // Step 1: collect the numbers if missing, then show the differential and options.
  function renderNumbersForm() {
    return (
      <Card padding="var(--pad-card-lg)">
        <h2 style={{ fontSize: "var(--title-m-size)", fontWeight: 600, fontFamily: "var(--font-sans)", marginBottom: 6 }}>
          A couple of numbers
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--body-m-size)", marginBottom: 18, maxWidth: "var(--measure-narrow)" }}>
          To show what you are leaving behind in real dollars, we need your pay and your current contribution. You know
          these from memory; we never guess them.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 320 }}>
          <Input
            label="Your gross yearly pay"
            prefix="$"
            inputMode="numeric"
            placeholder="e.g. 60000"
            value={grossPay}
            onChange={(e) => setGrossPay(e.target.value)}
          />
          <Input
            label="Your current contribution"
            suffix="% of pay"
            inputMode="numeric"
            placeholder="e.g. 3"
            value={currentRate}
            onChange={(e) => setCurrentRate(e.target.value)}
          />
          {error ? <p style={{ color: "var(--data-loss)", fontSize: "var(--caption-size)" }}>{error}</p> : null}
          <div>
            <Button
              disabled={isPending}
              onClick={() => {
                const dollars = Number(grossPay);
                const pct = Number(currentRate);
                if (!Number.isFinite(dollars) || dollars <= 0) {
                  setError("Please enter your yearly pay as a whole dollar amount.");
                  return;
                }
                if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
                  setError("Please enter your contribution as a percentage between 0 and 100.");
                  return;
                }
                runAction(
                  () => savePlanNumbersAction(v.accountId, Math.round(dollars * 100), Math.round(pct * 100)),
                  () => undefined,
                );
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  function renderFrequencyConfirm() {
    if (v.periodsPerYear == null) return null;
    return (
      <Card tone="sunk" elevation={0} padding="var(--pad-card)">
        <p style={{ fontSize: "var(--body-m-size)", color: "var(--text-body)", marginBottom: 12 }}>
          We see deposits about <strong>{frequencyLabel(v.periodsPerYear)}</strong>. Is that how often you are paid? We
          use it only to show a per paycheck figure.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" size="sm" onClick={() => { setFreqConfirmed(true); setFreqRejected(false); }}>
            Yes, that&rsquo;s right
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setFreqRejected(true); setFreqConfirmed(false); }}>
            No
          </Button>
        </div>
        {freqRejected ? (
          <p style={{ marginTop: 10, color: "var(--text-muted)", fontSize: "var(--body-s-size)" }}>
            Then we will show the yearly figures only, not a per paycheck amount.
          </p>
        ) : null}
      </Card>
    );
  }

  function renderOption(o: RateOption) {
    const showPerPaycheck = freqConfirmed && o.costPerPeriodMinor != null;
    return (
      <Radio
        key={o.targetBps}
        boxed
        name="target"
        value={String(o.targetBps)}
        checked={targetBps === o.targetBps}
        onChange={() => setTargetBps(o.targetBps)}
        label={
          <span>
            Contribute {formatBps(o.targetBps)}
            {o.atCap ? " (captures your full match)" : ""}
          </span>
        }
        description={
          <span>
            Captures {formatMoney(o.capturedAnnualMinor)} of match a year
            {showPerPaycheck
              ? `. About ${formatMoney(o.costPerPeriodMinor as number)} more per paycheck, roughly ${formatMoney(
                  o.takeHomePerPeriodMinor as number,
                )} less take home (assuming about ${formatBps(v.marginalRateBps)} in taxes, a rough illustration, not tax advice)`
              : ""}
          </span>
        }
      />
    );
  }

  function renderSeeAndChoose() {
    // Not enough history to be sure (a waiting problem, AC-9).
    if (v.blocker === "window") {
      return (
        <Card padding="var(--pad-card-lg)">
          <BuddyMessage>
            We can see your contributions, but not enough history yet to be sure how your match works (some plans pay it
            once a year). Check back once there is more, and we will not guess in the meantime.
          </BuddyMessage>
        </Card>
      );
    }
    // Already capturing everything (AC-8): congratulate, offer no change.
    if (v.alreadyFullyMatched) {
      return (
        <Card padding="var(--pad-card-lg)">
          <span className="fb-label">Good news</span>
          <p style={{ marginTop: 8, fontSize: "var(--body-l-size)", color: "var(--text-body)", maxWidth: "var(--measure-narrow)" }}>
            You are already capturing your full employer match. There is nothing left on the table, so there is nothing
            to change here.
          </p>
        </Card>
      );
    }

    const unclaimed = v.unclaimedAnnualMinor;
    return (
      <Card padding="var(--pad-card-lg)">
        {unclaimed != null && unclaimed > 0 ? (
          <>
            <Stat
              label={`Unclaimed ${v.employer ?? "employer"} match, each year`}
              value={unclaimed / 100}
              size="l"
            />
            <p style={{ marginTop: 10, color: "var(--text-body)", fontSize: "var(--body-m-size)", maxWidth: "var(--measure-narrow)" }}>
              That is money your employer has offered and you are not receiving yet. Raising your contribution captures
              it. {v.formulaProvisional ? "This rests on a match we have not confirmed with your plan, so check it first." : ""}
            </p>
            {v.formulaProvisional ? <Badge tone="attention">Based on an unconfirmed match</Badge> : null}
          </>
        ) : null}

        {renderFrequencyConfirm()}

        <div style={{ marginTop: "var(--gap-stack)" }}>
          <span className="fb-label">Choose a rate</span>
          <p style={{ margin: "6px 0 14px", color: "var(--text-muted)", fontSize: "var(--body-s-size)" }}>
            You decide the rate. We only show what each one would do; we never pick for you.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {v.rateOptions.map(renderOption)}
          </div>
        </div>

        <div style={{ marginTop: "var(--gap-stack)" }}>
          <Button disabled={targetBps == null} onClick={() => setStep(2)}>
            See how to turn it on
          </Button>
        </div>
      </Card>
    );
  }

  function renderTurnOn() {
    const picked = v.rateOptions.find((o) => o.targetBps === targetBps) ?? null;
    const targetLabel = targetBps != null ? formatBps(targetBps) : "your chosen rate";
    return (
      <Card padding="var(--pad-card-lg)" style={{ position: "relative" }}>
        {reported && picked ? (
          <WinMoment headline="Projected" value={formatMoney(picked.capturedAnnualMinor)} action={
            <Button variant="pop" onClick={() => setReported(false)}>Done</Button>
          }>
            If you set your rate to {targetLabel}, that is about this much of {v.employer ?? "your employer"}&rsquo;s match a
            year. This is a projection from what you told us, not money in your account yet.
          </WinMoment>
        ) : (
          <>
            <h2 style={{ fontSize: "var(--title-m-size)", fontWeight: 600, fontFamily: "var(--font-sans)", marginBottom: 6 }}>
              How to set your rate to {targetLabel}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--body-m-size)", marginBottom: 16, maxWidth: "var(--measure-narrow)" }}>
              You make this change in your plan&rsquo;s own website. We never change it for you.
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, color: "var(--text-body)", fontSize: "var(--body-m-size)" }}>
              <li>Log in to your workplace retirement plan&rsquo;s website (the one your employer set up).</li>
              <li>Find the setting for your contribution rate or paycheck deduction.</li>
              <li>Change it to {targetLabel} of your pay.</li>
              <li>Save the change.</li>
            </ol>
            <div style={{ marginTop: "var(--gap-stack)", display: "flex", gap: 10 }}>
              <Button onClick={() => setDialogOpen(true)}>I&rsquo;m ready to do this</Button>
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            </div>
          </>
        )}

        <Dialog
          open={dialogOpen}
          title={`Change your rate to ${targetLabel}?`}
          onClose={() => setDialogOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>Not yet</Button>
              <Button variant="pop" onClick={() => { setReported(true); setDialogOpen(false); }}>I changed it</Button>
            </>
          }
        >
          You will make this change in your plan&rsquo;s own site. FINBUDDY never changes your rate for you. When you have
          set it, come back and let us know.
        </Dialog>
      </Card>
    );
  }

  const numbersMissing = v.currentContributionBps == null || v.grossPayMinor == null;

  return (
    <Shell>
      <StepProgress steps={STEPS} current={step} />
      {step === 0 ? renderConfirm() : null}
      {step === 1 ? (numbersMissing ? renderNumbersForm() : renderSeeAndChoose()) : null}
      {step === 2 ? renderTurnOn() : null}
      <p style={{ color: "var(--text-faint)", fontSize: "var(--caption-size)", maxWidth: "var(--measure-prose)" }}>
        FINBUDDY explains your options and shows the dollars; you decide and make any change yourself. It cannot move
        money, place trades, or change your plan.
      </p>
    </Shell>
  );
}
