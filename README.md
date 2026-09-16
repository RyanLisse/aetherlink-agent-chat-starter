# AetherLink agent chat starter

This is a small desktop-first chat surface for the fictional support-triage workshop. It keeps the input ticket visible, makes the connector boundary explicit, and produces drafts that require human review.

Requires Node.js 22 or newer.

```sh
git clone https://github.com/RyanLisse/aetherlink-agent-chat-starter.git
cd aetherlink-agent-chat-starter
```

## Run the deterministic demo

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). This starts the Vite client and the loopback API together. Leave **Demo fixture** selected, then send a message. Demo mode returns one static, clearly labelled `WL-1026` JSON draft. It does not classify new tickets, call an agent, or contact a customer.

## Connect local Claude Code

Live mode is server-only. The browser sends the synthetic ticket and your question to the loopback server; the server calls `query()` from the Claude Agent SDK using the user's existing local Claude Code authentication. No API key is read by the browser or committed here.

```sh
cp .env.example .env
npm run build
npm start
```

Open [http://127.0.0.1:8787](http://127.0.0.1:8787), select **Claude Code**, and send a request. The connector exposes only `tools: ["Agent"]`, uses foreground-only inline specialist definitions, loads no user or project settings, configures no MCP servers, and applies an SDK `PreToolUse` gate for exactly two ordered calls. It disables session persistence and allows at most four turns, a 120-second runtime, and a `$1` SDK budget. Edit the inline `agents` map in `server/index.mjs` when teaching a different bounded specialist. The specialist definitions have no tools and the authoritative coordinator policy forbids customer or system actions. If local Claude authentication is unavailable, live mode remains open with an error.

The starter is intentionally loopback-only and accepts only the supplied synthetic `WL-1026` ticket. It does not persist messages or expose a public backend.

## Adapt the bounded route

To teach a different local scenario, change these exact seams together:

- `server/guard.mjs`: replace `SYNTHETIC_TICKET` and update `validateChatRequest` / `validateDecision` for the new input and output contract.
- `server/index.mjs`: update `promptFor` and the inline `agents` map. Keep `tools: ["Agent"]`, `settingSources: []`, the strict empty MCP configuration, and the specialist trace check unless the reviewed boundary changes.
- `src/main.tsx`: replace the visible `ticket` object and source-context copy.
- `tests/guard.test.mjs` and `e2e/chat.spec.ts`: change the contract assertions and visible smoke expectation.

The two `.claude/agents/*.md` files are optional manual Claude Code references; live mode uses inline definitions so an attendee's project settings cannot expand the server boundary.

## Checks

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

CI runs these checks with two browser workers. The browser smoke test covers loading the page, selecting the demo path, sending a message, and seeing the human-approval contract in the response. It cannot prove a live Claude run or human acceptance of wording.

## References

- [AI Elements chatbot example](https://elements.ai-sdk.dev/examples/chatbot) — the conversation and prompt-input interaction pattern that inspired this compact surface.
- [Claude Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) — the `query()` runtime and tool/permission model used by live mode.
- [Support-triage scenario](https://github.com/RyanLisse/aetherlink-agent-lab/tree/main/scenarios/support-triage) — the source contract and synthetic fixture used by the workshop.
