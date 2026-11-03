import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { git, history } from "../src/repository.js";

test("history counts actual selected commits and caps a longer history at 20", async t => {
  const root = await mkdtemp(path.join(tmpdir(), "mini-history-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await git(root, ["init"]);
  for (let i = 1; i <= 21; i++) {
    await git(root, ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", "commit", "--allow-empty", "-m", `fixture ${i}`]);
    if (i === 1 || i === 21) {
      const data = JSON.parse(await history(root));
      assert.equal(data.returnedCommitCount, Math.min(i, 20));
      assert.equal(data.commitHashes.length, data.returnedCommitCount);
      assert.equal(new Set(data.commitHashes).size, data.returnedCommitCount);
      assert.equal(data.commitHashes[0], (await git(root, ["rev-parse", "HEAD"])).trim());
      for (const hash of data.commitHashes) assert.ok(data.log.includes(hash));
      assert.match(data.evidence, /No diffs, tag inventory/);
      if (i === 21) {
        const oldest = (await git(root, ["rev-list", "--max-parents=0", "HEAD"])).trim();
        assert.ok(!data.commitHashes.includes(oldest));
        assert.ok(!data.log.includes(oldest));
      }
    }
  }
});

test("draft checks reject the observed inflated count and nonexistent citations", async () => {
  const { changelogClaims } = await import("./draft-claims.js");
  const hashes = Array.from({ length: 14 }, (_, i) => (i + 1).toString(16).padStart(40, "0"));
  const citation = `https://github.com/robertdevore/mini-agent/commit/${hashes[0]}`;
  assert.deepEqual(Object.values(changelogClaims(`These notes cover the 17 commits the history tool returned. ${citation}`, hashes)), [false, true]);
  assert.deepEqual(Object.values(changelogClaims(`These notes cover the 14 commits the history tool returned. ${citation}`, hashes)), [true, true]);
  assert.equal(changelogClaims(`https://github.com/robertdevore/mini-agent/commit/${"f".repeat(40)}`, hashes)["commit citations resolve within returned history"], false);
});
