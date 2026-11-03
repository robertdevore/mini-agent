# Compliance contract

| Category | Contract | Verification |
|---|---|---|
| Assignment | Node/TypeScript, official Claude SDK, configurable Sonnet | build, CLI smoke |
| Assignment | three skills, two authentic registry sources | provenance + official validation |
| Assignment | welcome exact first line | runtime assertion + positive/negative tests |
| Assignment | unrelated body exclusion | captured model request assertions |
| Spec mandatory | directory SKILL.md, YAML name/description, naming limits | parser tests + skills-ref |
| Spec optional | license, compatibility, metadata, allowed-tools | validation tests; permissions remain host-owned |
| Disclosure | catalog then activation then resources | fake client context assertions |
| Engineering choice | .skills precedence; nearest root; invalid skills fail | filesystem tests |
| Engineering choice | read-only tracked repository access, bounded loop | security/error tests |
| Excluded optional | script execution, automatic writes, arbitrary shell/network | no exposed tools |
| Live evaluation | real model selection, distinct from scripted tests | optional live suite and report |
