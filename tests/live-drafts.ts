import { runAgent, DEFAULT_MODEL } from "../src/agent.js";
import { diagnosticModel, draftFailure } from "./draft-diagnostics.js";
import { claude } from "../src/claude.js";
import { history } from "../src/repository.js";
import { changelogClaims, readmeClaims } from "./draft-claims.js";

// Submission checks for this repository, not production routing or general quality scoring.
// Print both drafts so the owner can verify facts and commit citations manually.
if (!process.env.ANTHROPIC_API_KEY) {
  console.log("SKIP: ANTHROPIC_API_KEY is not set. Draft quality was not evaluated.");
} else {
  const model = claude();
  console.log(`Model: ${process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL}`);
  const prompts = [
    "Generate a README draft for this project. Read the relevant repository files first. Cover installation, configuration, architecture, usage, and limitations. Do not write files.",
    "Generate release notes from recent commits. Our source repository is https://github.com/robertdevore/mini-agent. Cite the commit hash for each change.",
  ];
  for (const [index, prompt] of prompts.entries()) {
    const label = index === 0 ? "README" : "Changelog";
    const events: string[] = [];
    const trace: string[] = [];
    console.log(`\nStarting ${label} draft`);
    try {
      const result = await runAgent({ root: process.cwd(), prompt, model: diagnosticModel(model, events), trace: event => trace.push(event), modelId: process.env.ANTHROPIC_MODEL });
      const checks: Record<string, boolean> = {
        "expected skill activated": result.activated.includes(index === 0 ? "documentation-readme" : "wiki-changelog"),
        "known repository URL present": result.answer.includes("https://github.com/robertdevore/mini-agent"),
        "no Chinese-language switch": !/\p{Script=Han}/u.test(result.answer),
        "no repository placeholders": !/<(?:your-repository-url|your-checkout|owner|repo)>/.test(result.answer),
      };
      if (index === 0) {
        checks["project maintainer present"] = result.answer.includes("Robert DeVore");
        checks["upstream author not named as project maintainer"] = !/maintainer[^\n]*(?:Simon Dvorak|sidvorak@)/i.test(result.answer);
        checks["document returned directly"] = /^# Mini Agent\b/.test(result.answer);
        Object.assign(checks, readmeClaims(result.answer));
      }
      if (index === 1) {
        const data = JSON.parse(await history(process.cwd()));
        Object.assign(checks, changelogClaims(result.answer, data.commitHashes));
      }
      console.log(`\n--- ${index === 0 ? "README" : "Changelog"} draft ---\n${result.answer}\n`);
      for (const [label, pass] of Object.entries(checks)) {
        console.log(`${pass ? "PASS" : "FAIL"}: ${label}`);
        if (!pass) process.exitCode = 1;
      }
      console.log("MANUAL REVIEW REQUIRED: verify factual claims, completeness, commit citations and skill workflow fidelity. These checks are narrow heuristics, not a quality guarantee.");
    } catch (error) {
      console.error(`FAIL: ${label} draft: ${draftFailure(error)}`);
      for (const event of events) console.error(event);
      // Runtime trace contains fixed events and validated skill names, never raw model text.
      for (const event of trace.slice(-12)) console.error(`TRACE ${event}`);
      process.exitCode = 1;
    }
  }
}
