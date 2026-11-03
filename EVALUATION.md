# Evaluation

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
