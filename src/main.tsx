import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Mode = "demo" | "live";
type Message = { id: number; role: "user" | "assistant"; text: string; mode?: Mode; evidence?: { specialists: string[]; count: number; foreground: boolean } };

const ticket = {
  ticket_id: "WL-1026",
  customer: "Maarten",
  message: "I was charged twice. I need this fixed today or I will file a complaint.",
};

const initialMessages: Message[] = [
  {
    id: 1, mode: "demo",
    role: "assistant",
    text: "Welcome to the support triage workshop. I can prepare a draft for WL-1026, then pause for human review.",
  },
];

function App() {
  const [mode, setMode] = useState<Mode>("demo");
  const [messages, setMessages] = useState(initialMessages);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(text = value) {
    const message = text.trim();
    if (!message || busy) return;
    setValue("");
    setError("");
    setBusy(true);
    setMessages((current) => [...current, { id: Date.now(), role: "user", text: message }]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, message, ticket }),
      });
      const payload = (await response.json()) as { text?: string; error?: string; evidence?: Message["evidence"] };
      if (!response.ok) throw new Error(payload.error || "The connector could not answer.");
      setMessages((current) => [...current, { id: Date.now() + 1, role: "assistant", mode, evidence: payload.evidence, text: payload.text || "No draft returned." }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The connector could not answer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>AetherLink</span><span className="brand-divider">/</span><span className="muted">Agent workshop</span></div>
        <div className="status"><span className="status-dot" />Local workspace</div>
      </header>

      <section className="workspace">
        <div className="intro">
          <p className="eyebrow">SQUAD 1 · SUPPORT TRIAGE</p>
          <h1>Make the route visible<br /><em>before anyone acts.</em></h1>
          <p className="lede">A small chat surface for turning one fictional support ticket into a human-reviewable draft.</p>
        </div>

        <div className="modebar" aria-label="Connector mode">
          <span className="mode-label">Connection</span>
          <button className={mode === "demo" ? "mode active" : "mode"} onClick={() => setMode("demo")} type="button" disabled={busy}>Demo fixture <small>STATIC</small></button>
          <button className={mode === "live" ? "mode active" : "mode"} onClick={() => setMode("live")} type="button" disabled={busy}>Claude Code <small>LOCAL</small></button>
          <span className="mode-note">{mode === "demo" ? "No credentials · deterministic preview" : "Server only · uses your local Claude auth"}</span>
        </div>

        <div className="chat-layout">
          <section className="conversation" aria-label="Support triage conversation">
            <div className="conversation-head"><div><p className="eyebrow">WORKSHOP THREAD</p><h2>Support triage · WL-1026</h2></div><span className="draft-pill">DRAFT ONLY</span></div>
            <div className="messages" aria-live="polite">
              {messages.map((item) => <article className={`message ${item.role}`} key={item.id}><div className="avatar">{item.role === "assistant" ? "✦" : "M"}</div><div><span className="message-label">{item.role === "assistant" ? `Coordinator · ${item.mode === "live" ? "LOCAL" : "DEMO"}` : "You"}</span>{item.role === "assistant" && item.text.trim().startsWith("{") ? <pre className="result-json">{item.text}</pre> : <p>{item.text}</p>}{item.mode === "live" && item.evidence && <small className="live-evidence">Contract checked · {item.evidence.specialists.join(" → ")} · foreground · human review pending</small>}</div></article>)}
              {busy && <article className="message assistant"><div className="avatar">✦</div><div><span className="message-label">Coordinator</span><p className="thinking">Reading the bounded brief <span>···</span></p></div></article>}
            </div>
            {error && <p className="error" role="alert">{error}</p>}
            <form className="composer" onSubmit={(event) => { event.preventDefault(); void send(); }}>
              <textarea aria-label="Message coordinator" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ask the coordinator about this ticket…" rows={2} disabled={busy} />
              <div className="composer-foot"><span>Enter to send · Shift + Enter for a new line</span><button type="submit" disabled={busy || !value.trim()} aria-label="Send message">↑</button></div>
            </form>
          </section>

          <aside className="context" aria-label="Ticket context">
            <div className="context-head"><span className="eyebrow">SOURCE CONTEXT</span><span className="lock">⌑ LOCAL</span></div>
            <div className="ticket-id">{ticket.ticket_id}</div>
            <p className="customer">{ticket.customer}</p>
            <blockquote>“{ticket.message}”</blockquote>
            <div className="guard"><span>✓</span><div><strong>Human gate</strong><p>Every response stays a draft. Nothing is sent or changed.</p></div></div>
            <div className="agents"><span className="eyebrow">LIVE ROUTE</span><div><b>Coordinator</b><i>→</i><b>customer-reply</b><i>→</i><b>risk</b></div></div>
          </aside>
        </div>
      </section>
      <footer><span>Built for the AetherLink agent-native SDLC lab</span><span><a href="https://elements.ai-sdk.dev/examples/chatbot" target="_blank" rel="noreferrer">AI Elements pattern</a> · <a href="https://code.claude.com/docs/en/agent-sdk/overview" target="_blank" rel="noreferrer">Claude Agent SDK</a></span></footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
