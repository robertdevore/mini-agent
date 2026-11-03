import { parseArgs } from 'node:util';
import { discover, projectRoot } from './skills.js';
import { runAgent } from './agent.js';
import { claude } from './claude.js';
const help = `Mini Agent — read-only Claude + Agent Skills
Usage: npm run agent -- [--trace] "prompt"
       npm run agent -- --list-skills
Options: --help, --trace, --list-skills
Environment: ANTHROPIC_API_KEY (prompts only), ANTHROPIC_MODEL,
             MINI_AGENT_MAX_STEPS (1–30; default 12)
Root: nearest ancestor containing .git or package.json.
Output: answer on stdout; trace/errors on stderr. No file writes.
Exit codes: 0 success, 1 runtime/configuration error, 2 CLI usage error.`;
async function main() {
  let parsed;
  try { parsed = parseArgs({ options:{help:{type:'boolean'},trace:{type:'boolean'},'list-skills':{type:'boolean'}},allowPositionals:true,strict:true }); }
  catch { console.error('Invalid arguments. Use --help.'); process.exitCode=2; return; }
  const {values,positionals} = parsed;
  if (values.help) { console.log(help); return; }
  if ((values['list-skills'] && positionals.length) || (!values['list-skills'] && !positionals.length)) { console.error('Supply a prompt or --list-skills. Use --help.'); process.exitCode=2; return; }
  const root = await projectRoot();
  const trace = values.trace ? (event:string)=>console.error(event) : undefined;
  if (values['list-skills']) { for (const skill of (await discover(root,trace)).values()) console.log(`${skill.name}: ${skill.description}`); return; }
  const result = await runAgent({root,prompt:positionals.join(' '),model:claude(),modelId:process.env.ANTHROPIC_MODEL,maxSteps:process.env.MINI_AGENT_MAX_STEPS ? Number(process.env.MINI_AGENT_MAX_STEPS) : undefined,trace});
  console.log(result.answer);
}
main().catch(error=>{ console.error(error instanceof Error ? error.message : 'Agent failed'); process.exitCode=1; });
