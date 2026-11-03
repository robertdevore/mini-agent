# Mini Agent

A small, read-only Node.js CLI powered by Claude Sonnet. It discovers Agent Skills,
lets Claude choose workflows through tool calls, and loads each skill’s instructions
only when Claude activates it. Built for the Command Code engineering assignment.

## Run

Requires Node.js 22+ and Git. No global installs or API key are needed for offline tests
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
have a 60-second timeout and one SDK retry; output is limited to 8192 tokens per turn.
The agent reports an error if a response is cut short or the step limit is reached.

Create a key in the [Claude Console](https://platform.claude.com/settings/keys)
and ensure your account has API credits. See [API setup details](ENGINEERING-NOTES.md#anthropic-api-setup)
for the setup walkthrough.

## Skills and disclosure

- `welcome-me`: onboarding based on repository files. When this skill is activated,
  the answer must start with `> Welcome to our agent!`. The runtime rejects a missing
  or incorrect header; it does not repair it.
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

Discovery reads a prefix of at most 16 KiB and extracts only YAML frontmatter.
Any buffered body bytes are discarded; only names and descriptions enter the first
model request. `activate_skill` reads the selected full file;
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
They verify runtime behavior, not live routing accuracy.

`npm run test:live:drafts` generates a README and changelog using paid API requests.
It checks selected facts and known defects, and prints diagnostics on failure.
Review the generated text even when all checks pass.

See [EVALUATION.md](EVALUATION.md) for results and open verification items,
[SPEC-COMPLIANCE.md](SPEC-COMPLIANCE.md) for supported behavior, and
[ENGINEERING-NOTES.md](ENGINEERING-NOTES.md) for time spent, challenges, and process records.

Runtime dependencies: official `@anthropic-ai/sdk` and `yaml`; development uses
TypeScript, `tsx`, and Node types. MIT license; upstream skill notices remain
bundled. Maintainer: [Robert DeVore](https://github.com/robertdevore).
