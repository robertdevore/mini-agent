# Handoff

## Current Status
Latest owner diagnostics show both drafts hit the 4096-token output cap on turn four.
The shared allowance is now 8192, with explicit truncation errors and no partial-answer
acceptance. All 31 offline tests, typecheck, and build pass. Live verification is pending.

## Completed Phases
Foundation, runtime, three skills, trace and adversarial tests, live routing,
draft-quality review, exact history-count correction, and README completion instructions
with regression checks for the supplied defective passages.

## Known Issues
The editing session has no exported API key. The latest failures are diagnosed as
output truncation; the earlier run without diagnostics remains unclassified. The earlier 13-check live result predates
the completion fix and missed known defects; it does not validate the new instructions.
The expanded 17-check suite remains heuristic, so inspect the whole generated output.

## Next Agent Notes
Run npm run test:live:drafts in a credentialed shell and review both drafts against
repository evidence. Fix any remaining defects in generation and checks, rather than
leaving manual cleanup instructions. Keep the maintained README separate from test output.
