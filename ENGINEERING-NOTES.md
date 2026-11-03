# Engineering notes

Local wall-clock start: 2026-11-03T04:41:21Z (UTC; local calendar November 2).
Initial commit: ed5ac7c0096faa4070e419a229ee48e7584167e0.
GitHub-reported initial timestamp: 2026-11-03T04:41:31Z.
Baseline pushed before implementation. Existing Kujo working tree left untouched.

PackWrite 1.1.1 was inspected via help, doctor, config and its workflow skill.
No provider credentials were exported. Used its documented offline manifest seam
with an explicitly agent-authored plan (planning/pack-manifest.json), not a claimed
DeepSeek generation. PackWrite compiled and validated the execution pack.
Loop harness inspected and initialized; agent implements changes, harness runs gates.
Commits are made manually to retain meaningful messages without harness auto-amend.

Challenges: installed gh predates --source; repository created using authenticated
GitHub REST API then pushed normally. PackWrite launcher needed explicit KUJO path.
Live Anthropic credentials absent at initial inspection; offline tests cannot prove routing.

## Verification and workflow details

PackWrite's initial manifest attempts failed on output-rooted paths and required
handoff/phase headings. Those failures are visible in the early planning commits;
no implementation began until validation passed. Final planning validation passed
with nine advisory warnings about concise phases/prompts. The agent-authored offline
manifest is intentional and not evidence of a separate provider's reasoning.

Milestones are real commits: skill foundation, Claude runtime, three skills,
then adversarial/context tests. Loop ran actual npm tests/typecheck/build/diff gates.
Its harness reuses iteration 001 on each invocation; successful milestone evidence
is preserved under .loop-engineering/evidence/runtime, skills, and adversarial.
The runtime snapshot includes the foundation tests. Logs are committed explicitly.
A gate failure on whitespace inside saved patch evidence was resolved with a scoped
Git attribute for patch files; application whitespace checks remain enabled.

Official validator: agentskills/agentskills at
69ef37e9424c0a7ea9dd2293b559e43ec8176379. Initial Python 3.10 install failed because
skills-ref requires >=3.11; reran in a Python 3.11 virtual environment successfully.
This Python environment is upstream validation tooling only, not project runtime.
Commands (after installing skills-ref from the pinned upstream checkout):

```bash
skills-ref validate .agents/skills/welcome-me
skills-ref validate .agents/skills/wiki-changelog
skills-ref validate .agents/skills/documentation-readme
```

All three passed. Both external SKILL.md files were compared byte-for-byte against
the pinned upstream checkout and match. The documentation-readme registry URL
returned HTTP 200 and contains the named skill. Raw upstream licenses are bundled.

21 offline tests pass. The live command actually ran and skipped for absent
ANTHROPIC_API_KEY. No provider credentials were searched for in private files.
The separate skeptical review is in REVIEW.md; it is not a human endorsement.

## Time accounting

This is an AI-assisted engineering session, not measured human labor. Wall-clock
start was recorded explicitly above. No human hands-on stopwatch exists; human
hands-on time is therefore **not measured**, not equated with commit elapsed time.
Work proceeded continuously, with dependency installs, Git/network operations,
validator setup, and tests overlapping some editing. No substantial intentional
pause occurred. Wait time was not separately instrumented and cannot truthfully be
subtracted to claim an exact active-work duration. Final commit interval is recorded
below after verification, without rewriting commit dates.

## Clean clone

A fresh HTTPS clone at commit 397b13087f42871e031f09a732d6541b1df9b038
passed `npm ci`, all 21 tests, typecheck and build on Node 26.12.1 / npm 11.20.0.
The first install invocation using npm's `--prefix` unexpectedly reported a missing
self-package; running the documented `npm ci` from inside the clean checkout passed
without changing the lockfile. The checkout stayed clean. No Node 22 execution was
performed; >=22 is the supported API baseline, not a tested version matrix.
Formatting was subsequently normalized with ephemeral Prettier (no new dependency),
and the final formatted revision is verified again before delivery.

## Final implementation timeline

- Final verified implementation commit: `2e535a87781e008246bde612b3041037f34b912a`.
- GitHub-reported timestamp: **2026-11-03T04:53:39Z**.
- Initial-to-final implementation commit elapsed: **728 seconds (12 minutes 8 seconds)**.
- Recorded local start-to-final implementation commit: **738 seconds (12 minutes 18 seconds)**.
- Human hands-on engineering time: **not measured**; this interval is automated session wall time.
- No artificial dates, history rewrite, or baseline squash occurred.

The final documentation receipt necessarily follows the implementation commit: a
commit cannot embed its own SHA. The delivered repository HEAD and its timestamp
are recorded in the Strata handoff; use the following to recover the complete
initial-to-delivery interval exactly from this checkout:

```bash
git log --reverse --format='%H %cI %s'
node --input-type=module -e 'import {execFileSync as g} from "node:child_process"; const a=Number(g("git",["show","-s","--format=%ct","ed5ac7c"])); const b=Number(g("git",["show","-s","--format=%ct","HEAD"])); console.log("Initial-to-delivery seconds:",b-a)'
```

Final formatted revision also passed a clean-checkout `npm ci`, all 21 tests,
typecheck and build; `git status --short` was empty. The evidence receipt is
`.loop-engineering/evidence/final/clean-clone.md`. Only this receipt and timeline
were changed afterward. No runtime blocker remains; optional live evaluation
and the owner's personal hiring-submission review remain explicitly outstanding.
