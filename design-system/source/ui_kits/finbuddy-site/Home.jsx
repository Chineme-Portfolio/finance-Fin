const { Button, Card, Rule, Badge, Wordmark, Icon, Stat, AllocationBar, BuddyMessage, UserMessage, HoldingRow, Tag } = window.FINBUDDYDesignSystem_3b7855;

function Nav() {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px var(--page-gutter)", maxWidth: "var(--page-max)", margin: "0 auto" }}>
      <Wordmark size={19} />
      <nav style={{ display: "flex", gap: 28, fontSize: "var(--body-s-size)", color: "var(--text-muted)" }}>
        <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>How it works</a>
        <a href="#match" style={{ color: "inherit", textDecoration: "none" }}>The match</a>
        <a href="#trust" style={{ color: "inherit", textDecoration: "none" }}>What we can see</a>
        <a href="#faq" style={{ color: "inherit", textDecoration: "none" }}>Questions</a>
      </nav>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Button variant="ghost" size="sm">Sign in</Button>
        <Button size="sm">Link an account</Button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "48px var(--page-gutter) 72px", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 64, alignItems: "center" }}>
      <div>
        <span className="fb-label" style={{ color: "var(--clay-500)" }}>For people who never got the map</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 68, lineHeight: 1.02, letterSpacing: "-0.025em", color: "var(--text-strong)", margin: "16px 0 20px" }}>
          You already own investments. Do you know what they are?
        </h1>
        <p style={{ fontSize: "var(--body-l-size)", lineHeight: 1.65, color: "var(--text-body)", maxWidth: "46ch" }}>
          Link the 401(k) you got with a job and the brokerage account you opened on a whim. FINBUDDY reads them and tells you, in your own dollars, what you own and what your employer still owes you.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 30, alignItems: "center" }}>
          <Button size="lg" iconRight="arrow-right">Link an account</Button>
          <span style={{ fontSize: "var(--body-s-size)", color: "var(--text-faint)" }}>Free. Read-only. Two minutes.</span>
        </div>
      </div>
      <Card padding="var(--pad-card-lg)" elevation={2} radius="var(--radius-xl)" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Stat label="Everything you own" value={8412} size="l" animate />
          <Badge tone="gain">+12.4%</Badge>
        </div>
        <AllocationBar showLegend segments={[{ label: "US index", value: 5215 }, { label: "Target date", value: 1766 }, { label: "Single stocks", value: 926 }, { label: "Cash", value: 505 }]} />
        <Rule />
        <HoldingRow name="VTSAX" sub="Every public US company, in one fund" value="$5,215" percent={62} />
        <Rule />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--ink)", borderRadius: "var(--radius-md)", padding: "16px 18px" }}>
          <div>
            <div className="fb-label" style={{ color: "var(--apricot-400)" }}>Unclaimed match</div>
            <div className="fb-figure" style={{ fontSize: 30, color: "var(--paper)", marginTop: 4 }}>$1,240 a year</div>
          </div>
          <Icon name="arrow-right" size={20} style={{ color: "var(--apricot-400)" }} />
        </div>
      </Card>
    </section>
  );
}

function Steps() {
  const steps = [
    { n: "01", icon: "link", t: "Link what you already have", d: "Your 401(k), your brokerage account, the IRA you opened once. Read-only, and you can cut it off any time." },
    { n: "02", icon: "layers", t: "See what you actually own", d: "Not tickers. Plain sentences: what each fund holds, how much of your money is in it, and what a bad year would do to it." },
    { n: "03", icon: "gift", t: "Take the money already yours", d: "Most people we meet are leaving employer match behind. Fin works out how much, and walks you through claiming it." }
  ];
  return (
    <section id="how" style={{ maxWidth: "var(--page-max)", margin: "0 auto", padding: "0 var(--page-gutter) 88px" }}>
      <hr className="fb-rule" style={{ background: "var(--ink)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 40, marginTop: 40 }}>
        {steps.map(s => (
          <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ display: "inline-flex", width: 42, height: 42, borderRadius: "50%", background: "var(--clay-100)", color: "var(--clay-500)", alignItems: "center", justifyContent: "center" }}>
              <Icon name={s.icon} size={19} />
            </span>
            <span className="fb-label">{s.n}</span>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.015em", color: "var(--text-strong)" }}>{s.t}</h3>
            <p style={{ fontSize: "var(--body-m-size)", lineHeight: 1.65, color: "var(--text-muted)" }}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchBand() {
  return (
    <section id="match" className="fb-inverse" style={{ background: "var(--ink)", padding: "88px var(--page-gutter)" }}>
      <div style={{ maxWidth: "var(--page-max)", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
        <div>
          <span className="fb-label" style={{ color: "var(--apricot-400)" }}>The employer match</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 50, lineHeight: 1.06, letterSpacing: "-0.022em", color: "var(--paper)", margin: "16px 0 20px" }}>
            Your employer offered to pay you twice. Nobody explained the second part.
          </h2>
          <p style={{ fontSize: "var(--body-l-size)", lineHeight: 1.65, color: "#D9CEC2", maxWidth: "46ch" }}>
            A match is money your employer already agreed to pay you — you only get it if you contribute enough to trigger it. Miss it and it does not roll over. It is simply gone.
          </p>
          <div style={{ display: "flex", gap: 40, marginTop: 32 }}>
            <div><div className="fb-figure" style={{ fontSize: 40, color: "var(--apricot-500)" }}>$1,240</div><div style={{ fontSize: "var(--body-s-size)", color: "#B8ABA0", marginTop: 4 }}>left behind, median user</div></div>
            <div><div className="fb-figure" style={{ fontSize: 40, color: "var(--paper)" }}>7 min</div><div style={{ fontSize: "var(--body-s-size)", color: "#B8ABA0", marginTop: 4 }}>to change it</div></div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <UserMessage>so is the match free money or what</UserMessage>
          <BuddyMessage>
            <b>It is money you have already earned.</b> Brightline adds 50¢ for every $1 you put in, up to 6% of your pay. You are at 2%, so you are collecting a third of it. Moving to 6% costs you about $84 a paycheck and brings in $63 of theirs.
          </BuddyMessage>
          <UserMessage>ok do it</UserMessage>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const rows = [
    ["Balances and holdings", "Yes — that is the whole point"],
    ["Moving your money", "No. Never. Not even with permission"],
    ["Placing trades", "No"],
    ["Selling your data", "No"],
    ["Recommending products we get paid for", "No — we have none"]
  ];
  return (
    <section id="trust" style={{ maxWidth: 900, margin: "0 auto", padding: "88px var(--page-gutter)" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 40, lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--text-strong)", marginBottom: 8 }}>What FINBUDDY can and cannot do</h2>
      <p style={{ fontSize: "var(--body-m-size)", color: "var(--text-muted)", marginBottom: 28 }}>You are handing over a view of your money. Here is exactly how far that view goes.</p>
      <hr className="fb-rule" style={{ background: "var(--ink)" }} />
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0", gap: 24 }}>
            <span style={{ fontSize: "var(--body-l-size)", color: "var(--text-strong)" }}>{k}</span>
            <span style={{ fontSize: "var(--body-m-size)", color: "var(--text-muted)", textAlign: "right" }}>{v}</span>
          </div>
          <hr className="fb-rule" />
        </React.Fragment>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
        <Tag>Read-only access</Tag><Tag>Revoke any time</Tag><Tag>No affiliate products</Tag><Tag>No data sold</Tag>
      </div>
    </section>
  );
}

function Faq() {
  const qs = [
    ["Does it cost anything?", "No. FINBUDDY is free while we are small. If that changes, you will hear it from us before you see it on a bill."],
    ["Will it tell me what to buy?", "No. Fin explains what you already own and what your plan offers. Choosing is yours."],
    ["What if my 401(k) provider is obscure?", "Try it. We cover most plan administrators, and if yours is missing we will tell you straight away rather than half-linking it."],
    ["I have $300 invested. Is this for me?", "Yes. Especially then — the match is worth more to you than to anyone with a full portfolio."]
  ];
  return (
    <section id="faq" style={{ maxWidth: 900, margin: "0 auto", padding: "0 var(--page-gutter) 88px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px 56px" }}>
      {qs.map(([q, a]) => (
        <div key={q}>
          <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "var(--title-m-size)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>{q}</h4>
          <p style={{ fontSize: "var(--body-m-size)", lineHeight: 1.65, color: "var(--text-muted)" }}>{a}</p>
        </div>
      ))}
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--paper-sunk)", padding: "56px var(--page-gutter) 40px" }}>
      <div style={{ maxWidth: "var(--page-max)", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <Wordmark size={19} />
            <p style={{ fontSize: "var(--body-s-size)", color: "var(--text-muted)", marginTop: 12, maxWidth: "30ch" }}>Your money, in words you already use.</p>
          </div>
          {[["Product", ["How it works", "The match", "Security"]], ["Learn", ["What is a 401(k)?", "Index funds", "Vesting"]], ["Company", ["About", "Contact", "Terms"]]].map(([h, items]) => (
            <div key={h}>
              <div className="fb-label" style={{ marginBottom: 12 }}>{h}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map(i => <a key={i} href="#" style={{ fontSize: "var(--body-s-size)", color: "var(--text-muted)", textDecoration: "none" }}>{i}</a>)}
              </div>
            </div>
          ))}
        </div>
        <hr className="fb-rule" style={{ margin: "36px 0 20px" }} />
        <p style={{ fontSize: "var(--caption-size)", color: "var(--text-faint)", maxWidth: "80ch" }}>
          FINBUDDY is not a broker-dealer or an investment adviser. Nothing here is investment advice. Figures shown are illustrative.
        </p>
      </div>
    </footer>
  );
}

function Home() {
  return <div><Nav /><Hero /><Steps /><MatchBand /><Trust /><Faq /><Footer /></div>;
}

Object.assign(window, { Home, Nav, Hero, Steps, MatchBand, Trust, Faq, Footer });
