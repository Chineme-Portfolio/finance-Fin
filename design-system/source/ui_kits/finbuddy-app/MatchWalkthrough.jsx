const { Card, Rule, Button, Radio, Checkbox, StepProgress, Stat, Badge, WinMoment, Dialog, Tooltip, Icon } = window.FINBUDDYDesignSystem_3b7855;

function MatchWalkthrough({ onDone }) {
  const m = window.FB_DATA.match;
  const [step, setStep] = React.useState(0);
  const [rate, setRate] = React.useState("6");
  const [escalate, setEscalate] = React.useState(true);
  const [confirm, setConfirm] = React.useState(false);
  const [claimed, setClaimed] = React.useState(false);

  const options = [
    { v: "2", t: "2% — what you do now", d: "Brightline adds $21 a paycheck. You leave $42 of theirs behind." },
    { v: "4", t: "4% — halfway", d: "About $42 less in your pocket. Brightline adds $42." },
    { v: "6", t: "6% — the full match", d: "About $84 less in your pocket. Brightline adds $63. Nothing left behind." }
  ];

  if (claimed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640, margin: "0 auto" }}>
        <WinMoment headline="Done" value="$1,240 a year" action={<Button variant="pop" onClick={onDone}>Back to my money</Button>}>
          That is Brightline's money, and from your next paycheck it starts coming to you. Nothing else to do.
        </WinMoment>
        <Card padding="var(--pad-card-lg)" style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
          <Stat label="Per paycheck, you" value="$84" size="m" prefix="−$" />
          <Stat label="Per paycheck, them" value="$63" size="m" prefix="+$" />
          <Stat label="In a year, together" value="$3,822" size="m" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 24, maxWidth: 720, margin: "0 auto" }}>
      <StepProgress steps={["Your plan", "What you'd change", "Confirm"]} current={step} />

      <div>
        <span className="fb-label" style={{ color: "var(--clay-500)" }}>Employer match</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--display-3-size)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--text-strong)", marginTop: 10 }}>
          {step === 0 ? "Brightline offers to pay you twice." : step === 1 ? "How much do you want to put in?" : "One last look before it changes."}
        </h2>
      </div>

      {step === 0 ? (
        <Card padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ fontSize: "var(--body-l-size)", lineHeight: 1.65, color: "var(--text-body)", maxWidth: "58ch" }}>
            For every dollar you put into your 401(k), Brightline puts in 50 cents — up to {m.full}% of your pay. That is not a bonus or a perk. It is part of what they agreed to pay you, and you only get it if you ask for it by contributing.
          </p>
          <Rule />
          <div style={{ display: "flex", gap: 32 }}>
            <Stat label="You contribute now" value="2%" size="m" prefix="" />
            <Stat label="They will match up to" value="6%" size="m" prefix="" />
            <Stat label="Left behind each year" value={m.annual} size="m" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>
            <Icon name="info" size={15} />
            <span>Your money is <Tooltip content="Yours to keep. Brightline's share becomes yours after three years."><span style={{ borderBottom: "1px dotted var(--ink-25)" }}>vested</span></Tooltip> at year three. You are at year two.</span>
          </div>
          <Button size="lg" iconRight="arrow-right" style={{ alignSelf: "flex-start" }} onClick={() => setStep(1)}>Show me the options</Button>
        </Card>
      ) : null}

      {step === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {options.map(o => (
            <Radio key={o.v} boxed label={o.t} description={o.d} checked={rate === o.v} onChange={() => setRate(o.v)} />
          ))}
          <Card tone="warm" elevation={0} padding={18} style={{ marginTop: 4 }}>
            <Checkbox checked={escalate} onChange={setEscalate} label="Raise it 1% every January" description="Stops at 10%. You can turn this off any time." />
          </Card>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button iconRight="arrow-right" onClick={() => setStep(2)}>Review</Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <Card padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-body)" }}>Contribution</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--text-faint)", textDecoration: "line-through" }} className="fb-figure">2%</span>
              <span className="fb-figure" style={{ fontSize: "var(--figure-m-size)" }}>{rate}%</span>
            </span>
          </div>
          <Rule />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-body)" }}>Your take-home, per paycheck</span>
            <span className="fb-figure" style={{ fontSize: "var(--figure-s-size)", color: "var(--data-loss)" }}>−$84</span>
          </div>
          <Rule />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-body)" }}>Brightline adds, per paycheck</span>
            <span className="fb-figure" style={{ fontSize: "var(--figure-s-size)", color: "var(--data-gain)" }}>+$63</span>
          </div>
          <Rule />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-body)" }}>Automatic 1% raise each January</span>
            <Badge tone={escalate ? "gain" : "neutral"}>{escalate ? "On" : "Off"}</Badge>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button size="lg" onClick={() => setConfirm(true)}>Change it to {rate}%</Button>
          </div>
        </Card>
      ) : null}

      <Dialog open={confirm} width={440} title={"Change your contribution to " + rate + "%?"} onClose={() => setConfirm(false)}
        footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Not yet</Button><Button onClick={() => { setConfirm(false); setClaimed(true); }}>Yes, change it</Button></>}>
        This takes effect on your next paycheck, 15 September. You can change it back whenever you want — it is your plan.
      </Dialog>
    </div>
  );
}

Object.assign(window, { MatchWalkthrough });
