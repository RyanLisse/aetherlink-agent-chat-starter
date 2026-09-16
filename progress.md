# Progress — AetherLink agent chat starter

## Current state

- `PASS` — one conversation surface, visible source context, and explicit Demo fixture / Claude Code mode switch are implemented.
- `PASS` — demo response preserves `WL-1026`, uses the fixed high → escalate route, keeps `risk_note`, and requires human approval.
- `PASS` — loopback API validates origin, body size, message size, mode, and the synthetic ticket; one live request is allowed at a time.
- `PASS` — live connector is server-only and restricted to `Agent`, SDK hook gating, no user/project settings or MCP loading, inline definitions, four turns, a 120-second timeout, and a `$1` budget.
- `PASS` — inline `customer-reply` and `risk` definitions have no tools and draft-only prompts; `.claude/agents/` files are reference metadata for manual Claude Code use.
- `PASS` — build, Node contract test, and Playwright smoke workflow are included; execute them in CI or a remote environment.

## Open

- `OPEN` — the final foreground-definition repair still needs one authenticated live smoke and human wording review.
- `OPEN` — no public backend or deployment is part of this starter.
- `OPEN` — parent review must inspect the rendered UI and live agent trace before publication.
