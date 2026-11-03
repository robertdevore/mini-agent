import test from "node:test";
import assert from "node:assert/strict";
import { diagnosticModel, draftFailure } from "./draft-diagnostics.js";
import { runAgent } from "../src/agent.js";
import type { Model } from "../src/agent.js";

test("draft diagnostics distinguish truncation, refusal, and exhausted steps", async () => {
  for (const reason of ["max_tokens", "refusal", "tool_use"] as const) {
    const events: string[] = [];
    const model: Model = async () => ({ stop_reason: reason, content: reason === "tool_use" ? [{ type: "tool_use", id: "one", name: "unknown", input: {}, caller: { type: "direct" } }] : [] });
    await assert.rejects(runAgent({ root: process.cwd(), prompt: "test", maxSteps: 1, model: diagnosticModel(model, events) }), error => {
      assert.match(draftFailure(error), reason === "tool_use" ? /step limit/ : /incomplete or refused/);
      return true;
    });
    assert.deepEqual(events, [`Model turn 1: stop_reason=${reason}`]);
  }
});

test("draft diagnostics retain safe API status but never raw provider errors", async () => {
  const events: string[] = [];
  const error = Object.assign(new Error("secret-provider-payload"), { status: 429 });
  await assert.rejects(runAgent({ root: process.cwd(), prompt: "test", model: diagnosticModel(async () => { throw error; }, events) }), err => {
    assert.match(draftFailure(err), /Claude request failed/);
    return true;
  });
  assert.deepEqual(events, ["Model failure: request; HTTP 429"]);
  assert.ok(!draftFailure(error).includes("secret-provider-payload"));
});
