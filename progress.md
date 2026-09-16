# Progress — AetherLink agent chat starter

## Current state

- `PASS` — one conversation surface, visible source context, and explicit Demo fixture / Claude Code mode switch are implemented.
- `PASS` — demo response preserves `WL-1026`, uses the fixed high → escalate route, keeps `risk_note`, and requires human approval.
- `PASS` — loopback API validates origin, body size, message size, mode, and the synthetic ticket; one live request is allowed at a time.
- `PASS` — live connector is server-only and restricted to `Agent`, plan permission mode, project settings, and three turns.
- `PASS` — project `customer-reply` and `risk` agents are read-only metadata with draft-only prompts.
- `PASS` — build, Node contract test, and Playwright smoke workflow are included; execute them in CI or a remote environment.

## Open

- `OPEN` — no local live Claude authentication was used while building this starter.
- `OPEN` — no public backend or deployment is part of this starter.
- `OPEN` — parent review must inspect the rendered UI and live agent trace before publication.
