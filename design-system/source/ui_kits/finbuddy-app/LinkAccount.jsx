const { Card, Rule, Button, Input, Radio, StepProgress, Icon, Badge, BuddyAvatar, Toast } = window.FINBUDDYDesignSystem_3b7855;

const PROVIDERS = [
  { v: "fidelity", t: "Fidelity", d: "401(k), 403(b), IRA" },
  { v: "robinhood", t: "Robinhood", d: "Brokerage" },
  { v: "vanguard", t: "Vanguard", d: "IRA, brokerage" },
  { v: "empower", t: "Empower", d: "401(k)" }
];

function LinkAccount({ onDone, onCancel }) {
  const [step, setStep] = React.useState(0);
  const [provider, setProvider] = React.useState("fidelity");

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <StepProgress steps={["Choose", "Sign in", "Reading"]} current={step} />
      <div>
        <span className="fb-label">Link an account</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--display-3-size)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--text-strong)", marginTop: 8 }}>
          {step === 0 ? "Who holds it?" : step === 1 ? "Sign in to Fidelity" : "Reading your account"}
        </h2>
        <p style={{ fontSize: "var(--body-m-size)", color: "var(--text-muted)", marginTop: 10, maxWidth: "46ch" }}>
          {step === 0 ? "Pick the company on your statement. If you only have a login and no idea what it is, pick that one anyway."
            : step === 1 ? "FINBUDDY gets read-only access. It cannot move money or place trades."
            : "This takes about twenty seconds. Fin is working out what each holding actually is."}
        </p>
      </div>

      {step === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PROVIDERS.map(p => (
            <Radio key={p.v} boxed label={p.t} description={p.d} checked={provider === p.v} onChange={() => setProvider(p.v)} />
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button full iconRight="arrow-right" onClick={() => setStep(1)}>Continue</Button>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <Card padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Username" iconLeft="user" placeholder="marisol.r" />
          <Input label="Password" type="password" iconLeft="lock" defaultValue="passwordish" />
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>
            <Icon name="shield-check" size={16} style={{ color: "var(--pine-500)" }} />
            <span>Read-only. Revoke any time from Settings.</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
            <Button full onClick={() => { setStep(2); setTimeout(onDone, 1600); }}>Sign in</Button>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
          <BuddyAvatar size={44} />
          <p style={{ fontSize: "var(--body-m-size)", color: "var(--text-body)", maxWidth: "34ch" }}>Found a 401(k) worth $6,981. Working out what is inside it.</p>
          <div style={{ width: "100%", height: 6, borderRadius: "var(--radius-pill)", background: "var(--paper-deep)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "var(--radius-pill)", background: "var(--clay-500)", width: "70%", transition: "width var(--dur-slow) var(--ease-out)" }} />
          </div>
        </Card>
      ) : null}
    </div>
  );
}

Object.assign(window, { LinkAccount });
