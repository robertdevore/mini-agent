# Mini Agent implementation contract

Build a small TypeScript Node.js CLI with the official Anthropic SDK and a YAML parser.

## Assignment and specification

Include three skills. Let the model select them, require the exact welcome header,
and keep unrelated instructions out of context. Provide a clear CLI, offline tests,
and optional live tests.

Follow the Agent Skills directory format and progressive disclosure: metadata first,
selected instructions next, resources as needed. Validate name and description, plus
optional license, compatibility, metadata, and allowed-tools fields. Script execution
and automatic file writes are optional features that this client excludes.

## Runtime choices

Find the root by walking up to the nearest directory with .git or package.json.
Search .skills before .agents/skills. Reject malformed skills and report shadowed
duplicates. Read only frontmatter during discovery, full instructions on activation,
and individual resources through bounded skill-relative reads.

Allow repository inspection only after skill activation, and only for tracked files
that pass the sensitive-path exclusions. Provide no shell, dependency installation,
arbitrary network access, or file writes.

## Architecture

- skills.ts handles metadata, the catalog, and resources.
- repository.ts handles bounded read-only Git and file operations.
- agent.ts handles API message blocks and tool results.
- cli.ts handles flags and exit codes.

The model selects skills; keyword rules do not. Trace real runtime events to stderr.
Reject a welcome response with the wrong header rather than repairing it.

## External skills

Keep Microsoft's wiki-changelog unchanged. Provide Git history and remote context,
and honor its question when the user has not confirmed the repository source.

Replace UC Davis's documentation-project, which requires eleven files, writes, and
Mermaid rendering, with documentation-readme from the same published registry.
Print the README draft to stdout without claiming to write a file. Preserve upstream
text, licenses, and source attribution.

## Verification and delivery

Use deterministic model responses to test actual request context and tool-result
ordering. Evaluate live routing separately when ANTHROPIC_API_KEY is available.
Run official skills-ref validation, install/test/build from a clean clone, and a
separate skeptical review. Do not use scripted responses to claim live accuracy.

Work through the foundation, Claude runtime, three working skills, tracing and
adversarial tests, then final docs and review. Test and commit each milestone.
Use Loop checks after each stage. Record real timestamps and distinguish elapsed
session time from measured human hands-on time.
