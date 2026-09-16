# Intent — AetherLink agent chat starter

Status: `DRAFT — human review required`

## Outcome

Give a learner one small, watchable chat surface that can preview the support-triage route with a deterministic fixture and, when local Claude Code authentication is available, hand the same bounded ticket to a server-only Claude Agent SDK coordinator.

## Why

The workshop needs a visible boundary between a UI demo and a real local agent run. Learners should be able to see the source ticket, the coordinator route, the two specialist names, and the human approval gate without accidentally sending customer actions.

## Boundaries

- Synthetic ticket `WL-1026` only; no real customer or remote ticket data.
- Demo mode is static and must be labelled as such.
- Live mode binds to loopback, uses local Claude Code authentication, and keeps credentials server-side.
- The live agent may call exactly `customer-reply` and `risk` through the coordinator when the SDK supports project agents.
- No arbitrary tools, outbound messages, refunds, ticket edits, persistence, or public backend.
- Human approval remains required for every draft.

## Open questions

- `OPEN`: verify the exact Claude Code account and model used by the learner at runtime.
- `OPEN`: human reviewer must inspect one live trace and confirm both specialist calls are visible.
- `OPEN`: visual acceptance belongs to the parent review lane.
