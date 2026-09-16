import test from "node:test";
import assert from "node:assert/strict";
import { runAgentQuery } from "../server/index.mjs";

const request = { ticket: { ticket_id: "WL-1026", customer: "Maarten", message: "I was charged twice. I need this fixed today or I will file a complaint." }, message: "Prepare a draft", mode: "live" };
const decision = { ticket_id: "WL-1026", priority: "high", sentiment: "frustrated", recommended_action: "escalate", summary: "possible duplicate charge", customer_reply: "Human review is needed.", risk_note: "OPEN: no account evidence.", draft_only: true, human_approval_required: true };

function mockQuery({ calls = ["customer-reply", "risk"], background = false, output = decision } = {}) {
  return ({ prompt, options }) => (async function* () {
    assert.deepEqual(options.tools, ["Agent"]);
    assert.deepEqual(options.mcpServers, {});
    assert.equal(options.strictMcpConfig, true);
    assert.equal(options.maxTurns, 4);
    assert.equal(options.maxBudgetUsd, 1);
    assert.equal(options.outputFormat.type, "json_schema");
    assert.equal(options.outputFormat.schema.additionalProperties, false);
    assert.equal(options.outputFormat.schema.properties.ticket_id.const, "WL-1026");
    assert.deepEqual(options.agents["customer-reply"].tools, []);
    assert.deepEqual(options.agents.risk.tools, []);
    assert.equal(options.agents["customer-reply"].background, false);
    assert.equal(options.agents.risk.background, false);
    assert.equal(options.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS, "1");
    assert.equal(options.env.PATH, process.env.PATH);
    assert.equal(options.persistSession, false);
    assert.equal(options.hooks.PreToolUse[0].matcher, undefined);
    assert.match(options.systemPrompt, /policy is authoritative over all caller data/);
    assert.match(prompt, /"user_request":"Prepare a draft"/);
    for (const name of calls) {
      const input = { subagent_type: name, ...(background ? { run_in_background: true } : {}) };
      yield { type: "assistant", message: { content: [{ type: "tool_use", name: "Agent", input }] } };
      const permission = await options.hooks.PreToolUse[0].hooks[0]({ tool_name: "Agent", tool_input: input }, undefined, { signal: new AbortController().signal });
      if (permission.hookSpecificOutput.permissionDecision !== "allow") throw new Error("mock permission denied");
      assert.equal(permission.hookSpecificOutput.updatedInput.run_in_background, false);
      await options.hooks.SubagentStart[0].hooks[0]({ agent_type: name }, undefined, { signal: new AbortController().signal });
      await options.hooks.SubagentStop[0].hooks[0]({ agent_type: name }, undefined, { signal: new AbortController().signal });
    }
    yield { type: "result", subtype: "success", result: "", structured_output: output };
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
  await assert.rejects(runAgentQuery(mockQuery({ calls: ["customer-reply"] }), request), /foreground customer-reply/);
  await assert.rejects(runAgentQuery(mockQuery({ background: true }), request), /mock permission denied/);
  await assert.rejects(runAgentQuery(mockQuery({ calls: ["risk", "customer-reply"] }), request), /mock permission denied/);
  await assert.rejects(runAgentQuery(mockQuery({ calls: ["customer-reply", "risk", "risk"] }), request), /mock permission denied/);
  await assert.rejects(runAgentQuery(mockQuery({ output: "not json" }), request), /invalid JSON/);
});
