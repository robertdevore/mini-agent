const fs = require('node:fs');
const phases = ['project-brief','skill-foundation','claude-runtime','functional-skills','tracing-and-adversarial-tests','final-verification'];
const files = [
 ['MASTER.md', fs.readFileSync('MEGA_PROMPT.md','utf8')],
 ['TODO.md', '# Milestones\n'+phases.map((p,i)=>`- [ ] [${p}](phases/${String(i).padStart(2,'0')}-${p}.md)`).join('\n')],
 ['HANDOFF.md','# Handoff\nBaseline pushed. Implement contract; record evidence and remaining live verification honestly.'],
 ['DECISIONS.md','# Decisions\nRead-only output drafts. Proper YAML parsing. No routing shortcuts. External skill substitution documented in MASTER.'],
 ['REVIEW_CHECKLIST.md','# Review\n- [ ] Context isolation\n- [ ] Tool ordering and failures\n- [ ] Path boundaries\n- [ ] External skills usable\n- [ ] Honest live claims'],
 ['DEEPSEEK_START.md','# Implementation\nRead MASTER.md and execute TODO.md in order, testing each milestone.'],
 ['CODEX_REVIEW_PROMPT.md','# Independent review\nSkeptically inspect runtime boundaries, specification compliance, actual request context tests, external skill fidelity, and evidence claims. Fix substantive issues and record severity.'],
 ...phases.map((p,i)=>[`phases/${String(i).padStart(2,'0')}-${p}.md`,`# ${p}\n\n## Scope\nComplete ${p} against MASTER.md.\n\n## Acceptance criteria\nApplicable requirements have behavioral verification; no unverified claims.\n\n## Verification\nRun applicable npm tests, typecheck and build through Loop.\n`])
].map(([path,content])=>({path,content:content+'\n'}));
fs.writeFileSync('planning/pack-manifest.json',JSON.stringify({files},null,2)+'\n');
