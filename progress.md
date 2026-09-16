# Progress — AetherLink agent chat starter

## Current state

- `PASS` — one conversation surface, visible source context, and explicit Demo fixture / Claude Code mode switch are implemented.
- `PASS` — demo response preserves `WL-1026`, uses the fixed high → escalate route, keeps `risk_note`, and requires human approval.
- `PASS` — loopback API validates origin, body size, message size, mode, and the synthetic ticket; one live request is allowed at a time.
- `PASS` — live connector is server-only and restricted to `Agent`, SDK background tasks are disabled, hook gating enforces the exact sequence, and no user/project settings or MCP servers load.
- `PASS` — inline `customer-reply` and `risk` definitions have no tools and draft-only prompts; `.claude/agents/` files are reference metadata for manual Claude Code use.
- `PASS` — build, Node contract test, and Playwright smoke workflow are included; execute them in CI or a remote environment.

## Open

- `BLOCKED` — authenticated HTTP smoke on source `001cb4a` returned 502 (`Claude agent run did not complete`). Exact foreground specialist execution passed an earlier diagnostic, but end-to-end live connector acceptance has not passed. Demo mode remains the supported workshop path.
- `OPEN` — no public backend or deployment is part of this starter.
- `PASS` — parent inspected the desktop demo screenshot and real runtime evidence. Publication is demo-ready only; live completion and human wording acceptance remain open.
