# Mini Agent

A small, read-only Node.js CLI powered by Claude Sonnet. It discovers Agent Skills,
lets Claude choose workflows through tool calls, and loads each skill’s instructions
only when Claude activates it. Built for the Command Code engineering assignment.

## Run

Requires Node.js 22+ and Git. No global installs or API key are needed for tests
or skill listing. From this checkout:

```bash
npm ci
export ANTHROPIC_API_KEY='your-key'
npm run agent -- "I'm new to this project"
```

Run a prompt with `npm run agent -- "your prompt"`. For output with no npm
script banner, use `npm run --silent agent -- "your prompt"` or build once and
run `node dist/src/cli.js "your prompt"`. The CLI prints only the answer to
stdout. Never paste real credentials into committed files.

Three example prompts:

```bash
npm run agent -- --trace "First day here. Where should I start?"
npm run agent -- "Generate release notes from recent commits. Our source repository is https://github.com/robertdevore/mini-agent."
npm run agent -- "Document this project's architecture in a README draft."
```

`npm run agent -- --list-skills` lists metadata offline. `--help` explains options.
Try `"What's the weather?"` with `--trace` to see which skills stay out of context; this agent has no
weather tool. The model chooses workflows; there are no keyword routing rules.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | none | Required only for model requests |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Model override; account must have access |
| `MINI_AGENT_MAX_STEPS` | `12` | Maximum model turns, integer 1–30 |

The CLI does **not** load environment files automatically. Export variables in your shell
or use Node's explicit `--env-file=.env` when running the compiled CLI. Requests
have a 60-second timeout and one SDK retry; output is limited to 4096 tokens per turn.
The agent reports an error if a response is cut short or the step limit is reached.

## Get an Anthropic API key

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

## Skills and disclosure

- `welcome-me`: onboarding based on repository files; exact first line must be
  `> Welcome to our agent!`. The runtime rejects an answer that fails this check; it does not repair the header.
- `wiki-changelog`: Microsoft's original skill, backed by the latest 20 real
  commits and a sanitized origin URL. It asks you to confirm the repository source.
  Supply your repository URL or say it is local-only in the prompt.
- `documentation-readme`: UC Davis's original skill, producing a README draft
  from inspected project files. This replaces its much larger documentation
  suite. See [provenance, licenses, and rationale](THIRD-PARTY.md).

The agent finds the project root by walking up from the working directory to the
first directory with `.git` or `package.json`. It scans immediate child directories
of `.skills/`, then `.agents/skills/`. If a name appears in both, `.skills/` wins
and `--trace` reports the duplicate. The agent validates every discovered skill,
including duplicates, and stops on malformed metadata. It skips symlinked skill
directories and does not search your home directory.

Discovery reads only YAML frontmatter (up to 16 KiB). Only names and descriptions
enter the first model request. `activate_skill` reads the selected full file;
`read_skill_resource` reads individual files only inside an activated skill.
Each file is limited to 64 KiB. The agent reads resources one at a time.

Trace lines on stderr report runtime events: `DISCOVER`, `CATALOG`,
`SELECT`, `LOAD`, `RESOURCE`, `READ`, `VERIFY`, `ERROR`, and `DONE`. The trace does not log prompts,
API keys, raw tool arguments, or model reasoning. For unrelated requests,
`SELECT none` and `LOAD 0 skill instruction files` appear only when no skill was activated.

## Architecture and permissions

`src/skills.ts` handles discovery, YAML validation, activation, and bounded reads.
`src/agent.ts` runs the bounded tool loop and keeps messages in order.
`src/repository.ts` provides fixed read-only Git commands and tracked-file reads.
`src/claude.ts` wraps the official Anthropic SDK; `src/cli.ts` handles CLI I/O.

Repository inspection requires an activated skill. The agent lists up to
500 tracked files. It excludes hidden paths, skill bodies, workflow packs, build
and dependency folders, and obvious credential filenames. Realpath checks reject
traversal and symlink escapes. Tool arguments cannot become shell commands.
The agent validates `allowed-tools` metadata, but it grants no permissions.

This is not a sandbox or an automatic secret scanner. Work in a trusted checkout
that is not being modified concurrently. Tracked source and commit messages can
contain sensitive content: review the repository before sending it to a model.
Only the Anthropic SDK contacts a network service; no model tool can execute a
shell, install dependencies, fetch URLs, or change files. The agent prints documentation
for review; it does not write files. Exit codes are 0 success, 1 runtime/configuration failure, 2 CLI usage error.

## Verify

```bash
npm test
npm run typecheck
npm run build
npm run test:live  # optional; incurs API usage when a key is exported
```

Offline tests inject scripted model responses and inspect actual request contexts.
They check the runtime’s behavior. They do not measure live routing accuracy. See [EVALUATION.md](EVALUATION.md)
for test results, [SPEC-COMPLIANCE.md](SPEC-COMPLIANCE.md) for the contract,
[REVIEW.md](REVIEW.md) for the separate skeptical review, and
[ENGINEERING-NOTES.md](ENGINEERING-NOTES.md) for time, challenges, and Git evidence.

Runtime dependencies: official `@anthropic-ai/sdk` and `yaml`; development uses
TypeScript, `tsx`, and Node types. MIT license; upstream skill notices remain
bundled. Maintainer: [Robert DeVore](https://github.com/robertdevore).
