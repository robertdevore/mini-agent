# Mini Agent

A small, read-only Node.js CLI powered by Claude Sonnet. It discovers Agent Skills,
lets Claude choose relevant workflows through tool calls, and loads instructions
only after activation. Built for the Command Code engineering assignment.

## Run

Requires Node.js 22+ and Git. No global installs or API key are needed for tests
or skill listing. From this checkout:

```bash
npm ci
export ANTHROPIC_API_KEY='your-key'
npm run agent -- "I'm new to this project"
```

The single CLI command is `npm run agent -- "your prompt"`. For output with no npm
lifecycle banner, use `npm run --silent agent -- "your prompt"` or build once and
run `node dist/src/cli.js "your prompt"`. The CLI itself emits only the answer on
stdout. Never paste real credentials into committed files.

Three example prompts:

```bash
npm run agent -- --trace "First day here. Where should I start?"
npm run agent -- "Generate release notes from recent commits. Our source repository is https://github.com/robertdevore/mini-agent."
npm run agent -- "Document this project's architecture in a README draft."
```

`npm run agent -- --list-skills` lists metadata offline. `--help` explains options.
Try `"What's the weather?"` with `--trace` to inspect exclusion; this agent has no
weather tool. The model chooses workflows; there are no keyword routing rules.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | none | Required only for model requests |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Model override; account must have access |
| `MINI_AGENT_MAX_STEPS` | `12` | Maximum model turns, integer 1–30 |

Environment files are **not** loaded automatically. Export variables in your shell
or use Node's explicit `--env-file=.env` when running the compiled CLI. Requests
have a 60-second timeout and one SDK retry; output is bounded to 4096 tokens per turn.
The agent rejects truncated responses and step exhaustion instead of printing a
partial answer as success.

## Skills and disclosure

- `welcome-me`: actual repository onboarding; exact first line must be
  `> Welcome to our agent!`. A runtime assertion rejects a noncompliant answer;
  there is no silent header repair.
- `wiki-changelog`: Microsoft's original skill, backed by the latest 20 real
  commits and a sanitized origin URL. Its source-context question is preserved.
  Supply your repository URL or say it is local-only in the prompt.
- `documentation-readme`: UC Davis's original skill, producing a README draft
  from inspected project files. This replaces its much larger documentation
  suite. See [provenance, licenses, and rationale](THIRD-PARTY.md).

The root is the nearest ancestor of the working directory containing `.git` or
`package.json`. Only immediate child directories of `.skills/`, then
`.agents/skills/`, are scanned. `.skills/` wins duplicate names and `--trace`
reports shadowing. All discovered skill metadata is validated, even shadowed
entries; malformed skills stop execution instead of silently loading bad content.
Symlinked skill directories are not discovered. There is no home-directory search.

Discovery reads only YAML frontmatter (up to 16 KiB). Only names and descriptions
enter the first model request. `activate_skill` reads the selected full file;
`read_skill_resource` reads individual files only inside an activated skill.
Each file is limited to 64 KiB. No reference directories are loaded in bulk.

Trace lines on stderr originate from actual runtime events: `DISCOVER`, `CATALOG`,
`SELECT`, `LOAD`, `RESOURCE`, `READ`, `VERIFY`, `ERROR`, and `DONE`. No prompts,
API keys, raw tool arguments, or model reasoning are logged. For unrelated requests,
`SELECT none` and `LOAD 0 skill instruction files` appear only when none activated.

## Architecture and permissions

`src/skills.ts` handles discovery, YAML validation, activation, and bounded reads.
`src/agent.ts` owns the bounded tool loop and conversation ordering.
`src/repository.ts` provides fixed read-only Git commands and tracked-file reads.
`src/claude.ts` wraps the official Anthropic SDK; `src/cli.ts` handles CLI I/O.

Repository inspection requires an activated skill. The file list is limited to
500 tracked files; hidden paths, skill bodies, workflow packs, build/dependency
folders, and obvious credential filenames are excluded. Realpath checks reject
traversal and symlink escapes. Tool arguments cannot become shell commands.
`allowed-tools` metadata is validated but does not grant capabilities.

This is not a sandbox or an automatic secret scanner. Work in a trusted checkout
that is not being modified concurrently. Tracked source and commit messages can
contain sensitive content: review the repository before sending it to a model.
Only the Anthropic SDK contacts a network service; no model tool can execute a
shell, install dependencies, fetch URLs, or change files. Documentation is printed
for review, never written automatically. stdout/stderr control follows conventional
exit codes: 0 success, 1 runtime/configuration failure, 2 CLI usage error.

## Verify

```bash
npm test
npm run typecheck
npm run build
npm run test:live  # optional; incurs API usage when a key is exported
```

Offline tests inject scripted model responses and inspect actual request contexts.
They prove host behavior, **not** live routing accuracy. See [EVALUATION.md](EVALUATION.md)
for measured results, [SPEC-COMPLIANCE.md](SPEC-COMPLIANCE.md) for the contract,
[REVIEW.md](REVIEW.md) for the separate skeptical review, and
[ENGINEERING-NOTES.md](ENGINEERING-NOTES.md) for time, challenges, and Git evidence.

Runtime dependencies: official `@anthropic-ai/sdk` and `yaml`; development uses
TypeScript, `tsx`, and Node types. MIT license; upstream skill notices remain
bundled. Maintainer: [Robert DeVore](https://github.com/robertdevore).
