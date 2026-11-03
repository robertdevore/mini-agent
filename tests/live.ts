import { runAgent, DEFAULT_MODEL } from '../src/agent.js';
import { claude } from '../src/claude.js';
import { cases } from './routing-cases.js';
if (!process.env.ANTHROPIC_API_KEY) {
 console.log('SKIP: ANTHROPIC_API_KEY is not set. No live routing or output compliance measured.');
} else {
 const model=claude(); let failed=false;
 console.log(`Model: ${process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL}`);
 console.log('| Prompt | Expected | Observed | Result |');console.log('|---|---|---|---|');
 for(const item of cases){
  const selected=new Set<string>();
  try{
   const result=await runAgent({root:process.cwd(),prompt:item.prompt,model,modelId:process.env.ANTHROPIC_MODEL,trace:event=>{if(event.startsWith('SELECT ')&&event!=='SELECT none')selected.add(event.slice(7));}});
   const pass=JSON.stringify([...result.activated].sort())===JSON.stringify([...item.expected].sort());failed ||= !pass;
   console.log(`| ${item.prompt} | ${item.expected.join(', ')||'none'} | ${result.activated.join(', ')||'none'} | ${pass?'PASS':'FAIL'} |`);
  }catch{failed=true;console.log(`| ${item.prompt} | ${item.expected.join(', ')||'none'} | ${[...selected].join(', ')||'none'} | FAIL (API/runtime/header; no fabricated answer) |`);}
 }
 process.exitCode=failed?1:0;
}
