const fs = require('node:fs');
const phases = ['project-brief','skill-foundation','claude-runtime','functional-skills','tracing-and-adversarial-tests','final-verification'];
const files = [
 ['MASTER.md', fs.readFileSync('MEGA_PROMPT.md','utf8')],
 ['TODO.md', '# Milestones\n'+phases.map((p,i)=>`- [ ] [${p}](phases/${String(i).padStart(2,'0')}-${p}.md)`).join('\n')],
 ['HANDOFF.md','# Handoff\n## Current Status\nBaseline pushed.\n## Completed Phases\nPlanning.\n## Known Issues\nLive credentials absent.\n## Next Agent Notes\nFollow MASTER.md.'],
 ['DECISIONS.md','# Decisions\n## Confirmed\nRead-only output drafts. Proper YAML parsing. No routing shortcuts. External skill substitution documented in MASTER.\n## Open\nLive evaluation.\n## Log\nInitial contract.'],
 ['REVIEW_CHECKLIST.md','# Review\n- [ ] Context isolation\n- [ ] Tool ordering and failures\n- [ ] Path boundaries\n- [ ] External skills usable\n- [ ] Honest live claims'],
 ['DEEPSEEK_START.md','# Implementation\nRead MASTER.md and execute TODO.md in order, testing each milestone.'],
 ['CODEX_REVIEW_PROMPT.md','# Independent review\nSkeptically inspect runtime boundaries, specification compliance, actual request context tests, external skill fidelity, and evidence claims. Fix substantive issues and record severity.'],
 ...phases.map((p,i)=>[`phases/${String(i).padStart(2,'0')}-${p}.md`,`# ${p}\n\n## Goal\nDeliver verified milestone.\n\n## Out of scope\nUnrelated changes.\n\n## Read before starting\nMASTER.md\n\n## Implementation notes\nFollow the contract.\n\n## Handoff requirements\nRecord evidence.\n\n## Scope\nComplete ${p} against MASTER.md.\n\n## Acceptance criteria\n- [ ] Applicable requirements have behavioral verification; no unverified claims.\n\n## Suggested checks\nRun applicable npm tests, typecheck and build through Loop.\n`])
].map(([path,content])=>({path:"agent/"+path,content:content+'\n'}));
fs.writeFileSync('planning/pack-manifest.json',JSON.stringify({files},null,2)+'\n');
