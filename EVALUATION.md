# Evaluation

Current status: both owner-supplied drafts completed with the 8192-token allowance.
The README had one false-negative heuristic result, now fixed. Rechecking the supplied
text passes all text checks; skill activation remains owner-reported. All 32 offline
tests, typecheck, and build pass.

## Owner-reported verification — November 3, 2026

Robert DeVore supplied terminal output from a local run of the commands below.
The output names `claude-sonnet-5-5` as the live model. It does not record the
checkout's commit, runtime versions, or execution time. These are owner-reported
results, not a live run repeated by the editing agent.

| Command | Reported result |
|---|---|
| `npm ci` | Installed 17 packages; audited 18; zero vulnerabilities reported |
| `npm test` | 21 passed; zero failed, skipped, or cancelled; 2605.772296 ms |
| `npm run typecheck` | Completed without diagnostics |
| `npm run build` | Completed without diagnostics |
| `npm run agent -- --list-skills` | Listed documentation-readme, welcome-me, and wiki-changelog |
| `npm run test:live` | All eight scenarios passed on claude-sonnet-5-5 |

The install reported warnings about the user's `python` npm setting and install
scripts for esbuild and fsevents. The supplied output shows that installation and
verification continued successfully.

## Live routing results

| Prompt | Expected activation | Observed activation | Result |
|---|---|---|---|
| I'm new to this project. What should I do? | welcome-me | welcome-me | PASS |
| First day here. Where should I start? | welcome-me | welcome-me | PASS |
| Generate release notes from recent commits | wiki-changelog | wiki-changelog | PASS |
| Document this project's architecture | documentation-readme | documentation-readme | PASS |
| What's the weather? | none | none | PASS |
| What is 12 × 17? | none | none | PASS |
| Write a changelog and update project docs | documentation-readme, wiki-changelog | wiki-changelog, documentation-readme | PASS |
| What does the name welcome-me mean? Discuss the name only; do not onboard me. | none | none | PASS |

This run matched the expected skill set in eight of eight scenarios. Activation
order does not affect the result. A PASS also means the runtime returned a final
answer without an API, step-limit, or response-validation error. For both onboarding
scenarios, the runtime accepted the exact first-line welcome header.

The owner also supplied a separate onboarding response beginning with
`> Welcome to our agent!`. It described the repository components and setup,
cited source paths, and stated which files it had not read.

## What these checks establish

The offline tests cover real filesystem/Git operations, CLI subprocesses,
frontmatter validation, duplicate-name precedence, resource traversal and symlink
checks, API failures, exact header failures, bounded execution, batched skills,
and captured model request context. Their scripted model choices are test inputs;
they do not measure live selection accuracy.

The live suite checks skill selection and runtime completion. It does not score
answer quality, verify every factual claim, or prove that generated changelogs and
documentation are complete. For example, a changelog prompt without source
confirmation may correctly return a question. The arithmetic scenario checks that
no skill activates; the suite does not assert that the answer is 204.

Eight passes in one run are evidence for these prompts, not a guarantee of future
routing accuracy. Before submission, inspect actual changelog and documentation
drafts against the repository and check any commit citations.

## Earlier verification

During the original implementation session, `npm run test:live` returned SKIP
because ANTHROPIC_API_KEY was absent. The owner-reported run above adds live evidence
without changing that historical result.

ENGINEERING-NOTES.md and the Loop evidence record official skill validation and
clean-clone results. Passing format checks does not prove useful live behavior.

## Owner-supplied draft review — November 3, 2026

The owner next supplied a generated changelog and README for source review. This
exposed output-quality failures despite the eight routing passes:

- The README named upstream skill author Simon Dvorak as this project's maintainer,
  overriding README.md's Robert DeVore attribution. This is incorrect.
- Its preamble and closing notes switched to Chinese despite an English request.
- It left repository URL placeholders even though the project URL was available.
- Its claim that unrelated prompts activate no skill was too absolute; routing is
  model-dependent. Its API-key table also needed to distinguish offline tests from
  paid live tests.
- The changelog claimed 15 commits; the inspected history through 1a8b536 contains
  13, and its citations list those 13. All cited hashes resolve and the main file
  additions match the commits.
- It called the plan in a849dc2 validated. That commit's own message and early notes
  prematurely claimed validation; ENGINEERING-NOTES.md explains the failed attempts.
  The validated execution pack was committed in 427cf32.
- It grouped changes by category but omitted wiki-changelog's daily/weekly grouping.
  It correctly disclosed that it had not read diffs, so its breaking-change section
  is not a verified compatibility assessment.

The README's main module descriptions, tool names, settings, and numeric limits
match the inspected source. The drafts should not be submitted unchanged.

The system instructions now separate skill authorship from target-project facts,
prefer inspected repository facts over conflicting skill examples, preserve the
user's language, avoid known-value placeholders, and qualify claims based only on
commit messages. Upstream skill files remain unchanged. This is a prompt correction,
not a deterministic guarantee of model compliance.

Run `npm run test:live:drafts` with credentials to regenerate both outputs. It prints
the drafts and checks a few repository-specific facts, language drift, and placeholders.
Its checks are heuristics; inspect the drafts and citations even if they pass.
The editing agent had no exported API key and has not live-verified this correction.
The earlier eight-pass result applies to the previous prompt, not this revision.

## Second owner-supplied draft run — November 3, 2026

The owner reported another eight routing passes and all eleven draft heuristics
passing on claude-sonnet-5-5 after the authorship correction. The new README uses
Robert DeVore, the real repository URL, and English throughout. These observed
corrections do not make the heuristic checks a complete quality assessment.

Manual review still found errors:

- The changelog says 17 commits. There are 14 commits through its newest citation,
  723e051, and its entries cite those 14.
- It puts ec65208 under November 3 despite its November 2 23:54:26 −05:00 timestamp.
- It says there are no tags or version numbers without tag evidence; package.json
  does declare version 0.1.0. No tag inventory was available to the model.
- It describes a prompt instruction to use project facts as guaranteed behavior
  and labels 2e535a8 “evidence-only” despite that commit's source-formatting changes.
- The README's “tests need no key” should say offline tests. Large files are rejected,
  not partly returned; hidden-path exclusions apply to repository tools, not skill
  activation/resource reads. Truncation means the model hit its output budget, not
  that the API returned more than 4096 tokens. Remove first-person review commentary
  before using this as permanent project documentation.

The history tool now returns JSON with an exact returnedCommitCount, a limit of 20,
selected commitHashes, and the corresponding log from the same selected hashes.
Its evidence label states that diffs, tags, and the default branch were not queried.
System guidance uses that count, preserves supplied date offsets, avoids unsupported
tag claims, and uses commit-pinned file citations instead of guessing a branch.
A temporary-repository test checks both a one-commit history and a 21-commit history
capped at 20. These runtime changes still need a live rerun; the second owner run
predates them.

Local verification of the history change passed all 23 offline tests, typecheck,
build, and diff checks. The draft suite now also checks recognized English commit-count
claims and verifies cited commit hashes against returned history. These are still
heuristics: unrecognized wording, incorrect dates, and unsupported prose need review.

## Third owner-supplied draft run — November 3, 2026

The owner supplied a new npm run test:live:drafts result on claude-sonnet-5-5.
All seven README and six changelog heuristic checks passed. The output references
149dcbd as its newest commit; it does not independently record the tested checkout
SHA or execution timestamp. This is owner-reported live evidence, not an API run
repeated by the editing agent.

Git inspection confirms 15 commits through 149dcbd. The draft reports 15, cites
those commits, groups ec65208 under November 2 in its −05:00 author timezone,
and avoids claiming there are no tags or versions. It distinguishes commit-message
claims from recorded verification. The planning summary groups the three planning
commits without assigning successful validation to the first one. The README uses
Robert DeVore, English, the real repository URL, and the current history-tool fields.
The earlier material errors are corrected in this sample.

The following defects remained despite the passing checks:

- Say “offline tests and --list-skills” need no API key; live tests use one.
- Explicitly scope the exact welcome-header assertion to activated welcome-me responses.
- Remove the final first-person inspection note and the suggestion to add an email.
  Repository tools exclude skill paths, but activation loads the selected skill;
  that note should not imply skill instructions were unavailable.

The changelog's caveat that ENGINEERING-NOTES.md lacked verification for the two
latest fixes was accurate when generated: the 23-test evidence was in EVALUATION.md.
The engineering notes now cross-reference that evidence. The initial review treated
the remaining README defects as manual cleanup. The owner rejected that disposition;
the generator and live checks now address them, as recorded below.
The existing committed README remains the maintained project documentation; the
supplied draft has not replaced it. This is evidence for one run, not a promise of
perfect output on all future prompts.


## README completion correction — November 3, 2026

The owner requires the generator to finish its drafts even when the generated README
will not replace the maintained README. The earlier recommendation to leave these
issues for manual polish was withdrawn.

The system instructions now require complete document prose, omit optional missing
contact fields, prohibit inspection/editing narration, scope conditional runtime
claims, distinguish offline and paid live tests, and distinguish repository exclusions
from skill activation/resource reads. These are model instructions, not a guarantee
that every generated claim is correct.

The live README check now rejects the observed missing qualifications, inspection
narration, editing suggestions, and claim that activated skill contents were unread.
Four added checks bring the draft suite to 17 checks. Regression fixtures demonstrate
that the supplied defective passages fail and that a complete, scoped document with
neutral limitations passes. The checks recognize English patterns and do not establish
universal factual accuracy.

Local validation: all 26 offline tests, typecheck, build, and diff checks passed.
The editing session has no exported API key, so a fresh Sonnet draft remains unverified.
Run `npm run test:live:drafts` from a credentialed shell and inspect the complete output.
Do not treat the previous 13-check result as validation of these new instructions.


## Failed README run and diagnostic correction — November 3, 2026

The owner supplied a run after be94a69 with a generic generation failure instead of a
README. No README content or stop reason was recorded, so the cause cannot be assigned
to output truncation, the step limit, refusal, or an API failure. The changelog passed
its six checks; Git confirms 17 commits through be94a69. That does not make the combined
run successful, nor establish that every changelog claim is accurate.

The harness now identifies the failed workflow, reports known runtime failures,
records model stop reasons, and reports sanitized HTTP status/timeout/connection
categories. Failures include the final 12 runtime trace events. It never prints raw
provider exception messages or response bodies. Scripted regressions exercise truncation,
refusal, exhausted steps, and a provider failure containing a secret-like payload.
All 28 offline tests, typecheck, build, and diff checks pass. Production limits and retry
behavior are unchanged; the failure evidence does not justify changing them yet.

Next: run npm run test:live:drafts in a credentialed shell. Inspect the detailed error
if it fails, or the complete drafts if it succeeds. The editing session still lacks an
exported API key; the original README failure remains undiagnosed.


## Source review follow-up — November 3, 2026

Replaced one-byte discovery reads with a bounded 16 KiB buffer, retaining UTF-8 and
CRLF output, exact delimiter rules, and the existing byte limit. Tests cover a closing
newline exactly at the limit, an oversized header, missing or malformed delimiters,
invalid YAML, and exclusion of body text from returned metadata. Existing captured
model-request tests still confirm that unrelated skill bodies stay out of context.

Made the arbitrary-argument Git helper private and moved fixture-only Git execution
to tests. An export-surface test checks that only the four fixed repository operations
are public. Existing real-history and repository integration tests pass.

Validation: all 30 offline tests, typecheck, build, and diff checks passed. These
changes do not diagnose the earlier live README failure; the owner will rerun the
live draft suite with the new diagnostics. Submission-facing README cleanup preserves
the process history in ENGINEERING-NOTES.md and the existing development artifacts.


## Confirmed output truncation — November 3, 2026

The owner supplied diagnostic output for both drafts: three tool-use turns followed
by max_tokens on turn four. These runs hit the 4096-token response cap, not the
12-turn limit. Repository reads completed before the truncated response. This evidence
does not retroactively identify the cause of the earlier undiagnosed run.

Raised the shared per-turn output allowance to 8192 for the CLI and live suites.
No automatic retry or continuation was added. A truncated response still fails;
the error now names the cap and suggests a shorter document or narrower scope.
The higher ceiling permits longer responses and potentially higher output usage.

All 31 offline tests, typecheck, build, and diff checks passed. Scripted tests verify
the requested allowance, preservation of complete answers, rejection of partial
answers, and diagnostic reporting. They do not prove that 8192 tokens will suffice
for every live draft. The editing session has no exported API key; the owner will
rerun the live draft suite to verify the observed workflows.


## Completed drafts and false-negative correction — November 3, 2026

The owner supplied both complete drafts after the output-allowance change. Ten README
checks and six changelog checks passed; only the activation-scoped header check failed.
The README table explicitly says “When this skill is activated” and “the exact line”.
The checker searched for “header” or “first line”, so it failed to find that claim.

Added “exact line” to the recognized wording. Regression coverage accepts the supplied
row and rejects it with the activation condition removed or an unscoped second claim
added. The runtime and generation instructions are unchanged.

Replayed the text checks against the actual supplied drafts, using the 20-commit
window ending at 568a656 for changelog citations and counts. All 15 text checks pass;
the two skill-activation passes come from the supplied live output, not reconstructed
trace state. This accounts for all 17 checks without another paid API call. All 32
offline tests, typecheck, build, and diff checks pass.

The output-allowance increase worked for this observed run. The draft statements
that live verification was pending reflect the engineering documents at generation
time; this record now supplies the subsequent evidence. Heuristic passes do not
certify every sentence or future output. The maintained README is unchanged by this
sample, and the original pre-diagnostic failure remains historically unclassified.
