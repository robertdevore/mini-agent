import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
test("CLI help/list are offline, usage and missing credentials have stable exit codes", () => {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  const run = (...args: string[]) =>
    spawnSync(process.execPath, ["--import", "tsx", "src/cli.ts", ...args], {
      encoding: "utf8",
      env,
    });
  for (const flag of ["--help", "--list-skills"]) {
    const r = run(flag);
    assert.equal(r.status, 0);
    assert.equal(r.stderr, "");
    assert.ok(r.stdout.length > 0);
  }
  for (const args of [[], ["--no-such-option"], ["--list-skills", "extra"]]) {
    const r = run(...args);
    assert.equal(r.status, 2);
    assert.equal(r.stdout, "");
  }
  const r = run("hello");
  assert.equal(r.status, 1);
  assert.equal(r.stdout, "");
  assert.match(r.stderr, /Set ANTHROPIC_API_KEY/);
});
