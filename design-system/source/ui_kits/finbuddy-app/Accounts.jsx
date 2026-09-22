const { Card, Rule, Button, Badge, Switch, Icon, Tag } = window.FINBUDDYDesignSystem_3b7855;

function Accounts({ onLink }) {
  const d = window.FB_DATA;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 820 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <span className="fb-label">Settings</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "var(--display-3-size)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--text-strong)", marginTop: 8 }}>Linked accounts</h2>
        </div>
        <Button variant="secondary" iconLeft="plus" onClick={onLink}>Link another</Button>
      </div>

      <Card padding="var(--pad-card-lg)">
        {d.accounts.map((a, i) => (
          <React.Fragment key={a.name}>
            {i ? <Rule /> : null}
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0" }}>
              <span style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--bg-sunk)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flex: "none" }}>
                <Icon name={a.icon} size={19} />
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "var(--body-m-size)", fontWeight: 600, color: "var(--text-strong)" }}>{a.name}</span>
                <span style={{ display: "block", fontSize: "var(--body-s-size)", color: "var(--text-faint)" }}>{a.org}</span>
              </span>
              <Badge tone="gain">Synced {a.synced}</Badge>
              <span className="fb-figure" style={{ fontSize: "var(--figure-s-size)", width: 90, textAlign: "right" }}>{a.value}</span>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
          </React.Fragment>
        ))}
      </Card>

      <Card padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "var(--title-m-size)", fontWeight: 600, color: "var(--text-strong)" }}>What Fin tells you about</h4>
        <Switch defaultChecked label="When your employer match changes" description="Plans change their terms more often than people think." />
        <Rule />
        <Switch defaultChecked label="When cash has been sitting uninvested for 30 days" />
        <Rule />
        <Switch label="Monthly summary of what you own" description="First Monday of the month." />
        <Rule />
        <Switch label="Market drops of more than 5%" description="Off by default. Watching it rarely helps." />
      </Card>

      <Card tone="sunk" elevation={0} padding="var(--pad-card-lg)" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "var(--title-m-size)", fontWeight: 600, color: "var(--text-strong)" }}>Your data</h4>
        <p style={{ fontSize: "var(--body-s-size)", color: "var(--text-muted)", maxWidth: "62ch" }}>
          FINBUDDY reads your balances and holdings. It cannot move money, place trades, or change your plan on its own — every change is one you confirm.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag>Read-only access</Tag><Tag>Revoke any time</Tag><Tag>No data sold</Tag>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { Accounts });
