import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  symlink,
  rm,
  realpath,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  validate,
  discover,
  safePath,
  frontmatter,
  projectRoot,
} from "../src/skills.js";
test("metadata requirements and optional field constraints", () => {
  assert.equal(
    validate("name: 中文\ndescription: useful", "中文").name,
    "中文",
  );
  assert.throws(() =>
    validate("name: demo\ndescription: x\nmetadata: {3: value}", "demo"),
  );
  assert.throws(() =>
    validate("name: demo\ndescription: " + "x".repeat(1025), "demo"),
  );
  assert.throws(() =>
    validate(
      "name: demo\ndescription: x\ncompatibility: " + "x".repeat(501),
      "demo",
    ),
  );
  assert.equal(
    validate(
      "name: demo\ndescription: useful\nmetadata: {author: test}",
      "demo",
    ).name,
    "demo",
  );
  for (const yaml of [
    "name: demo",
    "name: Demo\ndescription: x",
    'name: demo\ndescription: ""',
    "name: demo\ndescription: x\nmetadata: {a: 1}",
    "name: demo\ndescription: x\nlicense: 3",
    "name: demo\ndescription: x\nunknown: y",
    "name: a--b\ndescription: x",
  ])
    assert.throws(() => validate(yaml, "demo"));
});
test("malformed YAML and duplicate keys fail", () => {
  for (const yaml of ["name: [", "name: demo\nname: demo\ndescription: x"])
    assert.throws(() => validate(yaml, "demo"));
});
test("discovery precedence, lazy resources, frontmatter-only and root search", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "mini-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "package.json"), "{}");
  for (const dir of [".skills/demo", ".agents/skills/demo"]) {
    await mkdir(path.join(root, dir), { recursive: true });
    await writeFile(
      path.join(root, dir, "SKILL.md"),
      "---\nname: demo\ndescription: useful\n---\nBODY_SECRET",
    );
  }
  await symlink(
    "/no-such-resource",
    path.join(root, ".skills/demo/reference.md"),
  );
  const catalog = await discover(root);
  assert.equal(catalog.size, 1);
  assert.match(catalog.get("demo")!.directory, /\.skills/);
  assert.equal(
    JSON.stringify([...catalog.values()]).includes("BODY_SECRET"),
    false,
  );
  assert.equal(
    (await frontmatter(path.join(root, ".skills/demo/SKILL.md"))).includes(
      "BODY_SECRET",
    ),
    false,
  );
  assert.equal(
    await projectRoot(path.join(root, ".skills/demo")),
    await realpath(root),
  );
  await assert.rejects(safePath(root, "../outside"));
  await symlink(tmpdir(), path.join(root, "escape"));
  await assert.rejects(safePath(root, "escape/test"));
});

test("bounded frontmatter preserves UTF-8, line endings and delimiter boundaries", async t => {
  const root = await mkdtemp(path.join(tmpdir(), "mini-header-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = path.join(root, "SKILL.md");
  for (const eol of ["\n", "\r\n"]) {
    const yaml = `name: demo${eol}description: café 中文 😀${eol}`;
    await writeFile(file, `---${eol}${yaml}---${eol}BODY_SECRET`);
    assert.equal(await frontmatter(file), yaml);
    assert.equal(validate(await frontmatter(file), "demo").description, "café 中文 😀");
  }
  // The closing newline must fit inside the existing 16 KiB byte limit.
  const yaml = "#" + "é".repeat(8187) + "\n";
  assert.equal(Buffer.byteLength(`---\n${yaml}---\n`), 16384);
  await writeFile(file, `---\n${yaml}---\n${"body".repeat(20000)}`);
  assert.equal(await frontmatter(file), yaml);
  for (const content of [
    `---\n${yaml} ---\n`, // delimiter beyond the limit
    "---\nname: demo\n---", // no closing newline, as before
    "---\nname: demo\n--- \n", // trailing space is not a delimiter
    "---\nname: demo", "", "---",
  ]) {
    await writeFile(file, content);
    await assert.rejects(frontmatter(file), /Unterminated or oversized/);
  }
  for (const content of ["name: demo\n---\n", "\uFEFF---\nname: demo\n---\n", " ---\n---\n"]) {
    await writeFile(file, content);
    await assert.rejects(frontmatter(file), /Missing YAML frontmatter/);
  }
  await writeFile(file, "---\nname: [\n---\nbody");
  assert.throws(() => validate("name: [\n", "demo"), /Malformed YAML/);
  assert.equal(await frontmatter(file), "name: [\n");
});
