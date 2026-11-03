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

## Later owner verification — November 3, 2026

After configuring an API key, Robert DeVore supplied terminal output showing a
successful install, 21 passing offline tests, typecheck, build, three listed skills,
and eight live routing passes on claude-sonnet-5-5. EVALUATION.md records the exact
prompts, observed activations, warnings, and limits. The output does not identify
the tested commit or execution time. The editing agent did not repeat paid API
calls. This later evidence does not alter the original delivery timeline.

## Draft-review corrections and verification — November 3, 2026

Commit 723e051 corrected system guidance for project facts, skill authorship,
language, and placeholders, and added a live draft-review command. Its local
verification passed 21 offline tests, typecheck, and build. The owner's next run
passed eight routing scenarios and eleven draft heuristics, but manual review still
found inaccurate changelog counts and unsupported claims.

Commit 149dcbd added exact history counts and selected hashes, plus count/citation
checks. Local verification passed 23 offline tests, typecheck, build, and diff
checks. The owner then supplied a live draft run with all 13 heuristics passing;
manual review confirmed the previously identified material errors were corrected
in that sample. EVALUATION.md records the findings, remaining editorial cleanup,
and limits. These later results do not alter the original delivery timeline.


### README completion correction

The owner rejected leaving known generated README defects for manual cleanup. The
system prompt now requires finished document prose and accurate scopes for tests,
header checks, and skill access. Four additional live checks reject the observed
patterns; three offline regression tests exercise faulty and corrected passages.
All 26 offline tests, typecheck, build, and diff checks passed. No API key is exported
in the editing session; fresh live verification of this change remains pending.


### Live draft failure diagnostics

The owner supplied a README generation failure and six passing changelog checks.
The old harness hid the failure reason. Added workflow labels, safe runtime messages,
model stop reasons, sanitized API failure categories, and bounded runtime trace output.
All 28 offline tests, typecheck, build, and diff checks pass. No production limits were
changed without evidence. The original failure needs a credentialed rerun to diagnose.


## Anthropic API setup


1. Sign in to the [Claude Console](https://platform.claude.com/).
2. Open [API keys](https://platform.claude.com/settings/keys), choose **Create key**,
   and name it `mini-agent`. For local development, link it to yourself and select
   a workspace. This CLI does not set a workspace header for an unscoped key.
3. Copy the key when it appears and store it securely; the Console shows it once.
4. Check [Billing](https://platform.claude.com/settings/billing) for available API
   credits. Buy credits if needed, or claim credits from an eligible Claude plan.

See Anthropic’s [key setup guide](https://platform.claude.com/docs/en/get-api-key)
and [billing guide](https://support.claude.com/en/articles/8977456-how-do-i-pay-for-my-claude-api-usage).
Eligible Max, Ultra, and Team subscribers can
[link a Console organization to claim API credits](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers).
These instructions were checked on November 3, 2026.

Export the key as shown in **Run**, then try an onboarding prompt. The CLI already
selects Sonnet through its model setting; you do not need a separate Sonnet key.
Run `npm run test:live` to check routing with your account. Keep the key out of
Git and chat messages.


## Development records

The maintained README is the entry point for running and understanding the CLI.
REVIEW.md contains the skeptical review; EVALUATION.md contains verification evidence.
PackWrite files in planning/ and agent/, Loop artifacts in .loop-engineering/, and
MEGA_PROMPT.md remain historical development records. The original prompt is not a
primary deliverable or a substitute for implementation evidence.

## Bounded discovery and private Git helper

Discovery now reads a buffer of at most 16 KiB, then locates complete delimiter lines
in bytes before decoding metadata as UTF-8. Short reads are handled within the same
bound. LF and CRLF are supported; closing delimiters still require a newline within
the limit. A body suffix can enter the temporary buffer but is neither returned nor
retained in the catalog or model request. This replaces the former one-byte reads.

The arbitrary-argument Git helper is now module-private. The repository module exports
only history, remote, listRepository, and readRepository. Tests use a separate helper
for fixture creation and independent Git assertions. This narrows the maintenance
surface without changing model-facing capabilities or claiming process isolation.
