import test from "node:test";
import assert from "node:assert/strict";
import { readmeClaims } from "./draft-claims.js";

const complete = `# Mini Agent
Offline tests and --list-skills work without an API key.
Live tests require an API key and incur API usage.

When welcome-me is activated, the first line must be exactly > Welcome to our agent!.

Repository tools exclude skill paths. Activation reads the selected skill body.

## Contact
Robert DeVore: https://github.com/robertdevore
`;

test("README checks accept a complete draft with scoped requirements", () => {
  assert.ok(Object.values(readmeClaims(complete)).every(Boolean));
});

test("README checks reject the owner's unfinished draft passages", () => {
  const cases: [string, string, string][] = [
    ["offline and paid live tests distinguished", "Offline tests and --list-skills work without an API key.", "Tests and --list-skills work without it."],
    ["welcome header explicitly scoped to activation", "When welcome-me is activated, the first line must be exactly > Welcome to our agent!.", "welcome-me gives a newcomer onboarding. The runtime rejects any answer whose first line is not exactly > Welcome to our agent!."],
    ["no inspection or editing commentary", "## Contact", "I haven't written this draft to disk.\n## Contact"],
    ["no inspection or editing commentary", "## Contact", "Add one here if you want to list it.\n## Contact"],
    ["no claim that activated skill contents were unread", "Repository tools exclude skill paths.", "I did not inspect the .skills/ or .agents/skills/ contents, because the tools exclude them."],
  ];
  for (const [check, before, after] of cases) {
    assert.equal(readmeClaims(complete.replace(before, after))[check], false, after);
  }
});

test("README checks fail missing evidence and preserve neutral limitations", () => {
  assert.equal(readmeClaims("# Mini Agent")["offline and paid live tests distinguished"], false);
  assert.equal(readmeClaims("# Mini Agent")["welcome header explicitly scoped to activation"], false);
  assert.ok(Object.values(readmeClaims(`${complete}\nHistory is limited to 20 commits; diffs and tags are unavailable.`)).every(Boolean));
});
