# Compliance matrix

Reference: https://agentskills.io/specification, reviewed 2026-11-03 UTC.
Reference implementation pinned in THIRD-PARTY.md. This is a focused skill client,
not a promise to implement every optional client feature.

| Category | Requirement/choice | Implementation | Verification |
|---|---|---|---|
| Assignment | Node.js + official Claude Sonnet SDK | cli.ts, claude.ts; configurable model | typecheck/build, CLI subprocess test |
| Assignment | Three skills; two from registry | .agents/skills; unchanged external sources | integration test, upstream byte comparison, THIRD-PARTY.md |
| Assignment | Newcomer welcome, exact header | welcome-me + strict final assertion | positive and negative agent tests; live unmeasured |
| Assignment | Unrelated welcome body excluded | metadata-only catalog, activation tool | captured request matrix |
| Mandatory format | SKILL.md with YAML name and description | skills.ts validate/frontmatter | malformed/missing/duplicate-key tests |
| Mandatory metadata | Name constraints, directory match, description limit | Unicode lowercase letters/numbers, hyphen rules, length checks | parser tests + official skills-ref |
| Optional metadata | license, compatibility, metadata, allowed-tools | type/length validation; no permission expansion | metadata tests |
| Disclosure | Metadata → selected instructions → needed resources | discover/activate/read_skill_resource | actual next-request and resource-read assertions |
| Optional resources | Relative reads in activated skill only | canonical path checks, 64 KiB cap | traversal, symlink, missing/large resource tests |
| Client choice | .skills before .agents/skills, nearest marked root | projectRoot/discover | filesystem integration test |
| Client choice | Invalid metadata fails; duplicates diagnosed | discover + SHADOW event | deterministic precedence test |
| Client choice | Read-only real project evidence | fixed git log/remote/ls-files and bounded reads | actual repository/history integration tests |
| Client choice | Bounded official tool loop; fail closed | agent.ts; 12 turns, 16 calls per batch | batching, malformed/unknown tools, API/stop/step tests |
| Client choice | stderr trace, stdout answer | cli.ts + actual runtime events | trace assertions, CLI tests |
| Excluded optional | Script execution, writes, broad filesystem search | no exposed tools | tool inventory and negative tests |
| Delivery | Plan, Loop, review, timeline, clean install | agent/, .loop-engineering/, notes | recorded gates + clean-clone verification |

Compatibility metadata is descriptive only. The runtime does not auto-install a
skill's dependencies or execute bundled scripts. `allowed-tools` is experimental
metadata, not a security boundary. Suggested 500-line skill-body guidance is not
misrepresented as a mandatory format rule. Host byte/turn/file caps are deliberate
engineering limits, not requirements imposed by the specification.
