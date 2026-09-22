const { Card, Rule, Button, BuddyMessage, UserMessage, ChatComposer, BuddyAvatar, AllocationBar } = window.FINBUDDYDesignSystem_3b7855;

const CANNED = {
  "what does vested mean": <span><b>It means the match is yours to keep.</b> Your own contributions are always yours. Brightline's share becomes yours after three years. You are at year two, so about $980 would stay behind if you left tomorrow.</span>,
  "am i too concentrated": <span><b>A bit, yes.</b> 62% of everything you own is in one fund — though that fund holds every public US company, so it is spread out inside. The riskier part is the $926 in two single stocks.</span>,
  "default": <span><b>Short answer: you own four things.</b> One fund holding the whole US market, one target-date fund, two single stocks, and $505 sitting in cash doing nothing. Want me to walk through them one at a time?</span>
};

function AskFin({ seed }) {
  const [thread, setThread] = React.useState(() => ([
    { who: "fin", body: <span><b>Morning. Your accounts synced two hours ago.</b> Nothing moved much — you are up $412 this month. Ask me anything about what you own, or about the match you have not claimed.</span> }
  ]));
  const [typing, setTyping] = React.useState(false);
  const endRef = React.useRef(null);

  const ask = React.useCallback((text) => {
    setThread(t => [...t, { who: "you", body: text }]);
    setTyping(true);
    setTimeout(() => {
      const key = text.toLowerCase().replace(/[?.!]/g, "").trim();
      setTyping(false);
      setThread(t => [...t, { who: "fin", body: CANNED[key] || CANNED.default }]);
    }, 900);
  }, []);

  React.useEffect(() => { if (seed) ask(seed); }, [seed, ask]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, minHeight: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <BuddyAvatar size={40} />
        <div>
          <div style={{ fontSize: "var(--title-m-size)", fontWeight: 600, color: "var(--text-strong)" }}>Fin</div>
          <div style={{ fontSize: "var(--body-s-size)", color: "var(--text-faint)" }}>Reads your accounts. Never sells you anything.</div>
        </div>
      </div>
      <Rule />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {thread.map((m, i) => m.who === "fin"
          ? <BuddyMessage key={i}>{m.body}</BuddyMessage>
          : <UserMessage key={i}>{m.body}</UserMessage>)}
        {typing ? <BuddyMessage typing /> : null}
        <div ref={endRef} />
      </div>
      <ChatComposer suggestions={["what does vested mean", "am i too concentrated", "what happens if I quit"]} onSend={ask} onSuggestion={ask} />
    </div>
  );
}

Object.assign(window, { AskFin });
