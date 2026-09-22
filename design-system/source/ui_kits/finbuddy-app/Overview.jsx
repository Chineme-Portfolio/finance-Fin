const { Card, Rule, Stat, Badge, Button, AllocationBar, HoldingRow, LineChart, ChatComposer, Icon } = window.FINBUDDYDesignSystem_3b7855;

function MatchBanner({ onStart }) {
  const m = window.FB_DATA.match;
  return (
    <Card tone="inverse" radius="var(--radius-xl)" padding="var(--pad-card-lg)" elevation={0}
      style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="fb-label" style={{ color: "var(--apricot-400)" }}>Unclaimed</span>
        <span className="fb-figure" style={{ fontSize: "var(--figure-l-size)", color: "var(--paper)" }}>{"$" + m.annual.toLocaleString()} a year</span>
        <p style={{ color: "#D9CEC2", maxWidth: "48ch", fontSize: "var(--body-m-size)", lineHeight: 1.6 }}>
          Brightline adds 50¢ for every $1 you put in, up to {m.full}% of your pay. You are putting in {m.rate}%. The rest of their offer is sitting there.
        </p>
      </div>
      <Button variant="pop" size="lg" iconRight="arrow-right" onClick={onStart}>Walk me through it</Button>
    </Card>
  );
}

function Overview({ onStart, onAsk }) {
  const d = window.FB_DATA;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <span className="fb-label">Wednesday, 1 September</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--display-2-size)", lineHeight: 1.04, letterSpacing: "-0.022em", color: "var(--text-strong)", marginTop: 10, maxWidth: "18ch" }}>
          You own $8,412 across three accounts.
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        <Card padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Stat label="Everything you own" value={d.total} size="xl" animate delta={12.4} deltaLabel="since January" />
          <Rule />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>You put in $4,890 of that.</span>
            <span style={{ fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>Your employer put in $1,610.</span>
            <span style={{ fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>The market added $1,912.</span>
          </div>
        </Card>
        <Card padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="fb-label">Last twelve months</span>
            <Badge tone="gain">+$1,912</Badge>
          </div>
          <LineChart points={d.history} height={150} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--caption-size)", color: "var(--text-faint)" }}>
            <span>Sep 2025</span><span>Sep 2026</span>
          </div>
        </Card>
      </div>

      <MatchBanner onStart={onStart} />

      <Card padding="var(--pad-card-lg)">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "var(--title-m-size)", fontWeight: 600, color: "var(--text-strong)" }}>Where your money sits</h4>
          <Button variant="ghost" size="sm" iconRight="arrow-right">See every holding</Button>
        </div>
        <AllocationBar showLegend segments={d.holdings.map(h => ({ label: h.name, value: h.raw, color: h.color }))} />
        <div style={{ marginTop: 20 }}>
          {d.holdings.map((h, i) => (
            <React.Fragment key={h.name}>
              {i ? <Rule /> : null}
              <HoldingRow {...h} onClick={() => {}} />
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Card tone="sunk" padding="var(--pad-card-lg)" elevation={0} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="message-circle" size={18} style={{ color: "var(--clay-500)" }} />
          <span style={{ fontSize: "var(--title-s-size)", fontWeight: 600, color: "var(--text-strong)" }}>Anything you want explained?</span>
        </div>
        <ChatComposer
          suggestions={["What is a target date fund?", "Am I too concentrated?", "What happens if I quit?"]}
          onSuggestion={onAsk} onSend={onAsk} />
      </Card>
    </div>
  );
}

Object.assign(window, { Overview, MatchBanner });
