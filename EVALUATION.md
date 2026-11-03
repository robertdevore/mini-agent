# Evaluation

The 21 offline behavioral tests, TypeScript check, and build pass. Tests cover real
filesystem/Git operations, CLI subprocesses, frontmatter validation, duplicate-name
precedence, resource traversal and symlink checks, API failure, exact header failure, bounded
loop, batched skills, and captured request context. Scripted model choices are test
inputs; they do not establish model selection accuracy.

| Prompt | Expected activation | Scripted runtime | Live Sonnet observation |
|---|---|---|---|
| I'm new to this project. What should I do? | welcome-me | pass | not run |
| First day here. Where should I start? | welcome-me | pass | not run |
| Generate release notes from recent commits | wiki-changelog | pass | not run |
| Document this project's architecture | documentation-readme | pass | not run |
| What's the weather? | none | pass | not run |
| What is 12 × 17? | none | pass | not run |
| Write a changelog and update project docs | both external skills | pass | not run |
| Discuss the welcome-me name without onboarding | none | pass | not run |

`npm run test:live` returned SKIP because ANTHROPIC_API_KEY was not exported.
Live API calls, routing accuracy, and model output compliance remain unverified.
With credentials, the suite prints expected/observed/pass-fail per scenario
and exits nonzero for any mismatch, API failure, or welcome assertion failure.
A changelog prompt without source confirmation may correctly return a question.

ENGINEERING-NOTES.md and the Loop evidence record official skill validation and
clean-clone results. Passing format checks does not prove useful live behavior.
