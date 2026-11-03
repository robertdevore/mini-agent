# Evaluation

Offline: 21 behavioral tests pass, plus TypeScript check and build. Includes real
filesystem/Git operations, CLI subprocesses, frontmatter validation, deterministic
precedence, resource traversal/symlinks, API failure, exact header failure, bounded
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

`npm run test:live` actually returned SKIP because ANTHROPIC_API_KEY is not exported.
No live API success, routing percentage, or real model output compliance is claimed.
When credentials exist, the suite prints expected/observed/pass-fail per scenario
and exits nonzero for any mismatch, API failure, or welcome assertion failure.
A changelog prompt without source confirmation may correctly return a question.

Official skill validation and clean-clone results are recorded in engineering notes
and the Loop evidence. Structural validation is distinct from useful live behavior.
