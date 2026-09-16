import test from "node:test";
import assert from "node:assert/strict";
import { runAgentQuery } from "../server/index.mjs";

const request = { ticket: { ticket_id: "WL-1026", customer: "Maarten", message: "I was charged twice. I need this fixed today or I will file a complaint." }, message: "Prepare a draft", mode: "live" };
const decision = { ticket_id: "WL-1026", priority: "high", sentiment: "frustrated", recommended_action: "escalate", summary: "possible duplicate charge", customer_reply: "Human review is needed.", risk_note: "OPEN: no account evidence.", draft_only: true, human_approval_required: true };

function mockQuery({ missingRisk = false, background = false, output = decision } = {}) {
  return ({ options }) => (async function* () {
    const calls = missingRisk ? ["customer-reply"] : ["customer-reply", "risk"];
    for (const name of calls) {
      const input = { subagent_type: name, run_in_background: background ? true : false };
      const permission = await options.canUseTool("Agent", input, { signal: new AbortController().signal });
      if (permission.behavior !== "allow") throw new Error("mock permission denied");
      yield { type: "assistant", message: { content: [{ type: "tool_use", name: "Agent", input }] } };
    }
    yield { type: "result", subtype: "success", result: typeof output === "string" ? output : JSON.stringify(output) };
  })();
}

test("injected agent transport returns checked output and visible evidence", async () => {
  const result = await runAgentQuery(mockQuery(), request);
  assert.equal(result.contractChecked, true);
  assert.equal(result.humanReviewPending, true);
  assert.deepEqual(result.evidence, { specialists: ["customer-reply", "risk"], count: 2, foreground: true });
  assert.match(result.text, /\"ticket_id\": \"WL-1026\"/);
});

test("injected transport rejects missing, background, and malformed agent runs", async () => {
  await assert.rejects(runAgentQuery(mockQuery({ missingRisk: true }), request), /foreground customer-reply/);
  await assert.rejects(runAgentQuery(mockQuery({ background: true }), request), /mock permission denied/);
  await assert.rejects(runAgentQuery(mockQuery({ output: "not json" }), request), /invalid JSON/);
});
