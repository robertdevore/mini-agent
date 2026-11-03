# Engineering notes

Local wall-clock start: 2026-11-03T04:41:21Z (UTC; local calendar November 2).
Initial commit: ed5ac7c0096faa4070e419a229ee48e7584167e0.
GitHub-reported initial timestamp: 2026-11-03T04:41:31Z.
Baseline pushed before implementation. Existing Kujo working tree left untouched.

PackWrite 1.1.1 was inspected via help, doctor, config and its workflow skill.
No provider credentials were exported. Used its documented offline manifest seam
with an explicitly agent-authored plan (planning/pack-manifest.json), not a claimed
DeepSeek generation. PackWrite compiled and validated the execution pack.
Loop harness inspected and initialized; agent implements changes, harness runs gates.
Commits are made manually to retain meaningful messages without harness auto-amend.

Challenges: installed gh predates --source; repository created using authenticated
GitHub REST API then pushed normally. PackWrite launcher needed explicit KUJO path.
Live Anthropic credentials absent at initial inspection; offline tests cannot prove routing.
