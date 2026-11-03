import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runAgent, type Model, type Request } from "../src/agent.js";
export const end = (text: string): Awaited<ReturnType<Model>> => ({
  stop_reason: "end_turn",
  content: [{ type: "text", text, citations: null }],
});
export const call = (
  name: string,
  input: unknown,
): Awaited<ReturnType<Model>> => ({
  stop_reason: "tool_use",
  content: [
    { type: "tool_use", id: "call1", name, input, caller: { type: "direct" } },
  ],
});
async function fixture(t: test.TestContext) {
  const root = await mkdtemp(path.join(tmpdir(), "agent-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const name of ["welcome-me", "wiki-changelog", "documentation-readme"]) {
    const dir = path.join(root, ".skills", name);
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, "SKILL.md"),
      `---\nname: ${name}\ndescription: Workflow for ${name}\n---\nPRIVATE_BODY_${name}\n`,
    );
  }
  return root;
}
test("activation enters the next model context, unrelated bodies stay excluded", async (t) => {
  const root = await fixture(t);
  const requests: Request[] = [];
  const events: string[] = [];
  const model: Model = async (request) => {
    requests.push(structuredClone(request));
    return requests.length === 1
      ? call("activate_skill", { name: "welcome-me" })
      : end("> Welcome to our agent!\nHello");
  };
  const result = await runAgent({
    root,
    prompt: "First day here",
    model,
    trace: (e) => events.push(e),
  });
  assert.deepEqual(result.activated, ["welcome-me"]);
  assert.ok(!JSON.stringify(requests[0]).includes("PRIVATE_BODY_"));
  assert.ok(JSON.stringify(requests[1]).includes("PRIVATE_BODY_welcome-me"));
  assert.ok(!JSON.stringify(requests).includes("PRIVATE_BODY_wiki-changelog"));
  assert.equal(requests[1]!.messages[1]!.role, "assistant");
  assert.equal(requests[1]!.messages[2]!.role, "user");
  assert.ok(events.includes("VERIFY Required header present"));
});
test("no activation means zero instruction bodies in every request", async (t) => {
  const root = await fixture(t);
  await runAgent({
    root,
    prompt: "Weather?",
    model: async (r) => {
      assert.ok(!JSON.stringify(r).includes("PRIVATE_BODY_"));
      return end("No live weather tool.");
    },
  });
});
test("unknown skills and invalid tool arguments become error results", async (t) => {
  const root = await fixture(t);
  let n = 0;
  await runAgent({
    root,
    prompt: "test",
    model: async (r) => {
      if (n++ === 0) return call("activate_skill", { name: "unknown" });
      const result = r.messages.at(-1)!.content as { is_error: boolean }[];
      assert.equal(result[0]!.is_error, true);
      return end("Unavailable");
    },
  });
});
test("API failures and incomplete responses cannot fabricate success", async (t) => {
  const root = await fixture(t);
  await assert.rejects(
    runAgent({
      root,
      prompt: "x",
      model: async () => {
        throw new Error("secret");
      },
    }),
    /Claude request failed/,
  );
  await assert.rejects(
    runAgent({
      root,
      prompt: "x",
      model: async () => ({ ...end("partial"), stop_reason: "max_tokens" }),
    }),
    /8192-token output limit/,
  );
});
test("exact welcome header fails closed", async (t) => {
  const root = await fixture(t);
  let n = 0;
  const events: string[] = [];
  await assert.rejects(
    runAgent({
      root,
      prompt: "onboard",
      trace: (e) => events.push(e),
      model: async () =>
        n++ === 0
          ? call("activate_skill", { name: "welcome-me" })
          : end("Welcome to our agent!"),
    }),
    /exact first-line/,
  );
  assert.ok(events.includes("VERIFY Required header FAILED"));
});
test("bounded execution rejects endless tools", async (t) => {
  const root = await fixture(t);
  await assert.rejects(
    runAgent({
      root,
      prompt: "x",
      maxSteps: 2,
      model: async () => call("activate_skill", { name: "wiki-changelog" }),
    }),
    /step limit/,
  );
});


test("requests allow longer drafts but still reject truncated text", async t => {
  const root = await fixture(t);
  const draft = "Complete document section.\n".repeat(1000);
  const result = await runAgent({ root, prompt: "Draft documentation", model: async request => {
    assert.equal(request.max_tokens, 8192);
    return end(draft);
  } });
  assert.equal(result.answer, draft);
  await assert.rejects(runAgent({ root, prompt: "Draft documentation", model: async request => {
    assert.equal(request.max_tokens, 8192);
    return { ...end(draft), stop_reason: "max_tokens" };
  } }), /no partial answer accepted/);
});
