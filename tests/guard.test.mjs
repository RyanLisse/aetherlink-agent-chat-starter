import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOrigin, validateChatRequest, validateDecision } from "../server/guard.mjs";

const ticket = { ticket_id: "WL-1026", customer: "Maarten", message: "I was charged twice. I need this fixed today or I will file a complaint." };

test("accepts the bounded synthetic ticket and loopback origins", () => {
  assert.deepEqual(validateChatRequest({ mode: "demo", message: "prepare a draft", ticket }), { mode: "demo", message: "prepare a draft", ticket });
  assert.equal(isAllowedOrigin("http://localhost:5173"), true);
  assert.equal(isAllowedOrigin("https://example.com"), false);
});

test("rejects arbitrary tickets and oversized messages", () => {
  assert.throws(() => validateChatRequest({ mode: "demo", message: "x", ticket: { ...ticket, ticket_id: "REAL-1" } }));
  assert.throws(() => validateChatRequest({ mode: "demo", message: "x", ticket: { ...ticket, private_note: "unexpected" } }));
  assert.throws(() => validateChatRequest({ mode: "live", message: "x".repeat(4001), ticket }));
});

test("accepts only a draft decision matching the fixed route", () => {
  const decision = { ticket_id: "WL-1026", priority: "high", sentiment: "frustrated", recommended_action: "escalate", summary: "possible duplicate charge", customer_reply: "Human review is needed.", risk_note: "OPEN: no account evidence.", draft_only: true, human_approval_required: true };
  assert.deepEqual(validateDecision(decision), decision);
  assert.throws(() => validateDecision({ ...decision, recommended_action: "auto_reply" }));
  assert.throws(() => validateDecision({ ...decision, human_approval_required: false }));
});
