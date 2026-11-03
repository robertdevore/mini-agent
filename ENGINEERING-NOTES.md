# Engineering notes

This records the original implementation session. Later documentation edits do not
change its test results or timeline.

## Baseline and tools

- Local wall-clock start: 2026-11-03T04:41:21Z (UTC; November 2 in the local timezone).
- Initial commit: ed5ac7c0096faa4070e419a229ee48e7584167e0.
- GitHub-reported initial timestamp: 2026-11-03T04:41:31Z.

The agent pushed the baseline before implementation and left the existing Kujo
working tree untouched.

The agent checked PackWrite 1.1.1 through its help, doctor, config, and workflow
skill. No provider credentials were exported, so it used the documented offline
manifest interface with its own plan in planning/pack-manifest.json. PackWrite
compiled and validated that plan; DeepSeek did not generate it.

The agent inspected and initialized Loop, implemented the changes, and used Loop
to run verification checks. It made commits manually to give them meaningful
messages and avoid the harness's automatic amendments.

The installed gh version did not support --source. The agent created the repository
through the authenticated GitHub REST API, then pushed normally. PackWrite also
needed an explicit KUJO path. Anthropic credentials were absent; offline tests
could not establish live routing accuracy.

## Planning and milestone checks

Early PackWrite attempts failed because manifest paths lacked the output root and
handoff/phase files lacked required headings. The early planning commits retain
these failures. Implementation began only after validation passed, with nine
advisory warnings about the short phases and prompts. The offline plan does not
represent a second model's reasoning.

Separate commits cover the skill foundation, Claude runtime, three skills, and
adversarial/context tests. Loop ran npm tests, typecheck, build, and diff checks.
The harness reuses iteration 001 on each run. Saved milestone evidence lives under
.loop-engineering/evidence/runtime, skills, and adversarial. The runtime snapshot
includes the foundation tests, and the logs are committed.

Whitespace inside saved patch evidence caused one check to fail. A Git attribute
exempts patch files from whitespace checks; application files remain checked.

## Skill and runtime validation

The official validator came from agentskills/agentskills commit
69ef37e9424c0a7ea9dd2293b559e43ec8176379. Installation under Python 3.10 failed
because skills-ref requires >=3.11. Installation and validation then passed in a
Python 3.11 virtual environment. Python served only the upstream validator, not
the project runtime.

After installing skills-ref from that pinned checkout, the agent ran:

```bash
skills-ref validate .agents/skills/welcome-me
skills-ref validate .agents/skills/wiki-changelog
skills-ref validate .agents/skills/documentation-readme
```

All three skills passed. Byte comparisons confirmed that both external SKILL.md
files matched their pinned upstream sources. The documentation-readme registry URL
returned HTTP 200 and contained the named skill. Upstream licenses are bundled.

All 21 offline tests passed. The live command ran but skipped because
ANTHROPIC_API_KEY was absent. The agent did not search private files for credentials.
REVIEW.md records its separate skeptical review; no human endorsement is implied.

## Clean-clone verification

A fresh HTTPS clone at 397b13087f42871e031f09a732d6541b1df9b038 passed `npm ci`,
all 21 tests, typecheck, and build on Node 26.12.1 / npm 11.20.0. An earlier install
with npm's `--prefix` reported a missing self-package. Running the documented
`npm ci` inside the checkout passed without changing the lockfile. The checkout
stayed clean. Node 22 was not tested; >=22 is the supported API baseline, not a
tested version matrix.

The agent then formatted the source with a temporary Prettier installation, adding
no project dependency. The final formatted revision also passed `npm ci`, all 21
tests, typecheck, and build in the separate checkout. `git status --short` was
empty. The receipt is `.loop-engineering/evidence/final/clean-clone.md`.

## Time accounting

These times measure the automated session, not human labor. Human hands-on time
was **not measured**. Work continued without a substantial planned pause; installs,
Git/network operations, validator setup, and tests overlapped some editing.
Waiting was not measured separately, so it cannot be subtracted to give an exact
active-work duration. Commit dates were not rewritten.

## Original delivery timeline

- Final verified implementation commit: `2e535a87781e008246bde612b3041037f34b912a`.
- GitHub-reported timestamp: **2026-11-03T04:53:39Z**.
- Initial-to-final implementation commit: **728 seconds (12 minutes 8 seconds)**.
- Recorded local start-to-final implementation commit: **738 seconds (12 minutes 18 seconds)**.
- Human hands-on engineering time: **not measured**.
- No artificial dates, history rewrite, or baseline squash occurred.

The documentation receipt followed the implementation commit because a commit
cannot contain its own SHA. The original delivery commit was
`ec652087700f18d38e3d5ce0ad093c20b15c7fcf` at **2026-11-03T04:54:26Z**. The Strata
handoff records it. These commands show the history and calculate the original
baseline-to-delivery interval, even after later commits:

```bash
git log --reverse --format='%H %cI %s'
node --input-type=module -e 'import {execFileSync as g} from "node:child_process"; const a=Number(g("git",["show","-s","--format=%ct","ed5ac7c"])); const b=Number(g("git",["show","-s","--format=%ct","ec65208"])); console.log("Initial-to-delivery seconds:",b-a)'
```

That interval is **775 seconds (12 minutes 55 seconds)**. Only the receipt and
timeline changed between the verified implementation and original delivery.
No runtime blocker remained. Optional live evaluation and the owner's review
before hiring submission were still outstanding.
