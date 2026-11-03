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
