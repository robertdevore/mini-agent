import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  rm,
  symlink,
  realpath,
} from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { runAgent, type Model } from "../src/agent.js";
import {
  safePath,
  readBounded,
  discover,
  frontmatter,
  activate,
} from "../src/skills.js";
const end: Awaited<ReturnType<Model>> = {
  stop_reason: "end_turn",
  content: [{ type: "text", text: "Done", citations: null }],
};
async function temp(t: test.TestContext) {
  const root = await mkdtemp(path.join(tmpdir(), "boundary-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
test("symlink escapes and traversal rejected; in-root resource works", async (t) => {
  const root = await temp(t);
  await mkdir(path.join(root, "skill"));
  await writeFile(path.join(root, "outside"), "secret");
  await symlink(path.join(root, "outside"), path.join(root, "skill/link"));
  await assert.rejects(safePath(path.join(root, "skill"), "link"), /escapes/);
  for (const file of ["../outside", "/etc/passwd", "a/../../outside", "a\\b"])
    await assert.rejects(safePath(path.join(root, "skill"), file));
  await writeFile(path.join(root, "skill/ref"), "reference");
  assert.equal(
    await readBounded(await safePath(path.join(root, "skill"), "ref")),
    "reference",
  );
});
test("missing resources and bounded regular file reads fail clearly", async (t) => {
  const root = await temp(t);
  await assert.rejects(safePath(root, "missing"), { code: "ENOENT" });
  await writeFile(path.join(root, "large"), "x".repeat(65537));
  await assert.rejects(readBounded(path.join(root, "large")), /64 KiB/);
  await assert.rejects(readBounded(root), /regular file/);
});
test("invalid skills fail discovery and metadata changes invalidate activation", async (t) => {
  const root = await temp(t);
  const dir = path.join(root, ".skills/demo");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "SKILL.md"), "---\nname: demo\n---\nbody");
  await assert.rejects(discover(root), /description/);
  await writeFile(
    path.join(dir, "SKILL.md"),
    "---\nname: demo\ndescription: before\n---\nbody",
  );
  const catalog = await discover(root);
  await writeFile(
    path.join(dir, "SKILL.md"),
    "---\nname: demo\ndescription: after\n---\nbody",
  );
  await assert.rejects(activate(catalog.get("demo")!), /changed/);
});
test("frontmatter handles CRLF and UTF-8 without accepting missing delimiters", async (t) => {
  const root = await temp(t);
  const file = path.join(root, "SKILL.md");
  await writeFile(
    file,
    "---\r\nname: demo\r\ndescription: café\r\n---\r\nbody",
  );
  assert.match(await frontmatter(file), /café/);
  await writeFile(file, "---\nname: demo");
  await assert.rejects(frontmatter(file), /Unterminated/);
});
test("resource before activation, arbitrary tools, extra args are rejected", async () => {
  for (const [name, input] of [
    [
      "read_skill_resource",
      { name: "welcome-me", path: "references/first-steps.md" },
    ],
    ["shell", { command: "echo hacked" }],
    ["activate_skill", { name: "welcome-me", extra: true }],
    ["read_repository", { path: "README.md" }],
  ] as const) {
    let n = 0;
    await runAgent({
      root: process.cwd(),
      prompt: "test",
      model: async (request) => {
        if (n++ === 0)
          return {
            stop_reason: "tool_use",
            content: [
              {
                type: "tool_use",
                id: "t",
                name,
                input,
                caller: { type: "direct" },
              },
            ],
          };
        assert.equal(
          (request.messages.at(-1)!.content as { is_error: boolean }[])[0]!
            .is_error,
          true,
        );
        return end;
      },
    });
  }
});
test("activated resource is loaded lazily and traced from real read", async () => {
  let n = 0;
  const events: string[] = [];
  await runAgent({
    root: process.cwd(),
    prompt: "onboard",
    trace: (e) => events.push(e),
    model: async (request) => {
      if (n++ === 0)
        return {
          stop_reason: "tool_use",
          content: [
            {
              type: "tool_use",
              id: "a",
              name: "activate_skill",
              input: { name: "welcome-me" },
              caller: { type: "direct" },
            },
          ],
        };
      if (n === 2) {
        assert.ok(
          !JSON.stringify(request).includes(
            "compare which skill instructions were loaded",
          ),
        );
        return {
          stop_reason: "tool_use",
          content: [
            {
              type: "tool_use",
              id: "b",
              name: "read_skill_resource",
              input: { name: "welcome-me", path: "references/first-steps.md" },
              caller: { type: "direct" },
            },
          ],
        };
      }
      assert.match(
        JSON.stringify(request.messages.at(-1)),
        /compare which skill instructions were loaded/,
      );
      return {
        ...end,
        content: [
          { type: "text", text: "> Welcome to our agent!", citations: null },
        ],
      };
    },
  });
  assert.ok(events.includes("RESOURCE welcome-me file read"));
});
test("empty final, empty tool batch and invalid step limit fail", async () => {
  for (const response of [
    { ...end, content: [] },
    { stop_reason: "tool_use", content: [] },
  ] as Awaited<ReturnType<Model>>[])
    await assert.rejects(
      runAgent({
        root: process.cwd(),
        prompt: "test",
        model: async () => response,
      }),
    );
  await assert.rejects(
    runAgent({
      root: process.cwd(),
      prompt: "test",
      maxSteps: NaN,
      model: async () => end,
    }),
    /Step limit/,
  );
});
