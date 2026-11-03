import test from "node:test";
import assert from "node:assert/strict";
import { runAgent, type Model } from "../src/agent.js";
import { discover } from "../src/skills.js";
import {
  history,
  listRepository,
  readRepository,
  remote,
} from "../src/repository.js";
const end = (text: string): Awaited<ReturnType<Model>> => ({
  stop_reason: "end_turn",
  content: [{ type: "text", text, citations: null }],
});
const call = (name: string, input: unknown): Awaited<ReturnType<Model>> => ({
  stop_reason: "tool_use",
  content: [
    { type: "tool_use", id: "c", name, input, caller: { type: "direct" } },
  ],
});
test("bundled skills have genuine instructions, resources and repository evidence", async () => {
  const catalog = await discover(process.cwd());
  assert.equal(catalog.size, 3);
  assert.ok((await listRepository(process.cwd())).includes("src/agent.ts"));
  assert.match(await history(process.cwd()), /initialize Command Code/);
  assert.equal(
    await remote(process.cwd()),
    "https://github.com/robertdevore/mini-agent",
  );
  assert.match(
    await readRepository(process.cwd(), "package.json"),
    /anthropic/,
  );
  for (const file of [
    ".env",
    ".agents/skills/welcome-me/SKILL.md",
    "../README.md",
  ])
    await assert.rejects(readRepository(process.cwd(), file));
});
test("real changelog tools deliver real commit evidence to model", async () => {
  let n = 0;
  await runAgent({
    root: process.cwd(),
    prompt:
      "Generate release notes; source URL https://github.com/robertdevore/mini-agent",
    model: async (r) => {
      if (n++ === 0) return call("activate_skill", { name: "wiki-changelog" });
      if (n === 2) {
        assert.match(
          JSON.stringify(r.messages.at(-1)),
          /Source Repository Resolution/,
        );
        return call("git_history", {});
      }
      assert.match(
        JSON.stringify(r.messages.at(-1)),
        /initialize Command Code/,
      );
      return end("Draft based on returned commits.");
    },
  });
});
test("documentation workflow receives actual project file data", async () => {
  let n = 0;
  await runAgent({
    root: process.cwd(),
    prompt: "Document architecture in README",
    model: async (r) => {
      if (n++ === 0)
        return call("activate_skill", { name: "documentation-readme" });
      if (n === 2) return call("read_repository", { path: "src/agent.ts" });
      assert.match(JSON.stringify(r.messages.at(-1)), /runAgent/);
      return end("# README draft");
    },
  });
});
