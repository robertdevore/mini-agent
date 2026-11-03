# Skill provenance

skills.sh is a third-party directory, not an official Agent Skills registry.
The bundled upstream files below are unchanged and retain their licenses.

| Skill | Registry | Upstream pin | License/dependencies |
|---|---|---|---|
| wiki-changelog | https://www.skills.sh/microsoft/skills/wiki-changelog | microsoft/skills @ 7a2367fc8a7d834c15b5ee8543a3d86c3003608f, .github/plugins/deep-wiki/skills/wiki-changelog/SKILL.md | MIT, bundled LICENSE; git history, origin URL, README; no scripts |
| documentation-readme | https://skills.sh/ucdavis/ai-skills-registry/documentation-readme | ucdavis/ai-skills-registry @ c0b2e4b0289836a8db9cebf996869c7cc4344c41, skills/documentation-readme/SKILL.md | MIT, bundled LICENSE; project data; no scripts/resources |

The agent inspected documentation-project and its three references at the same
UC Davis commit. It requires eleven written documentation files,
link checks and rendered Mermaid diagrams. That exceeds this read-only CLI.
The smaller documentation-readme skill produces a Markdown draft suitable for
README.md. The CLI prints it for the user to review and save. This is a different
upstream skill, not an edited version of documentation-project. Its maintainer
field names the skill author; the model must read this project’s README to find
the project maintainer.

wiki-changelog requires asking whether a repository is local-only or has a source
URL. The CLI preserves this requirement. Supply the URL in the prompt to avoid a
clarification-only response. git_remote and git_history return real repository
data. The history tool returns the latest 20 commits, as its description states.

Specification/reference tooling reviewed at agentskills/agentskills commit
69ef37e9424c0a7ea9dd2293b559e43ec8176379 (Apache-2.0).
Sources: https://agentskills.io/home and https://agentskills.io/specification.
Model default verified against https://platform.claude.com/docs/en/models/overview
on 2026-11-03 UTC: claude-sonnet-5-5. Access depends on the caller's account;
ANTHROPIC_MODEL overrides the default. No live request has yet been verified.
