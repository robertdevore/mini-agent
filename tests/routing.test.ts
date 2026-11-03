import test from "node:test";
import assert from "node:assert/strict";
import { runAgent, type Model } from "../src/agent.js";
import { cases } from "./routing-cases.js";
// Scripted selections are inputs, NOT evidence of live model routing accuracy.
test("acceptance prompt matrix preserves context boundaries under scripted selections", async () => {
  for (const scenario of cases) {
    let calls = 0;
    const result = await runAgent({
      root: process.cwd(),
      prompt: scenario.prompt,
      model: async (request) => {
        if (calls++ === 0) {
          assert.ok(!request.system.includes("# Project onboarding"));
          assert.ok(!request.system.includes("# Wiki Changelog"));
          assert.ok(!request.system.includes("# README Generation Skill"));
          if (scenario.expected.length)
            return {
              stop_reason: "tool_use",
              content: scenario.expected.map((name, i) => ({
                type: "tool_use" as const,
                id: `c${i}`,
                name: "activate_skill",
                input: { name },
                caller: { type: "direct" as const },
              })),
            };
        }
        const context = JSON.stringify(request.messages);
        for (const [name, marker] of [
          ["welcome-me", "# Project onboarding"],
          ["wiki-changelog", "# Wiki Changelog"],
          ["documentation-readme", "# README Generation Skill"],
        ])
          assert.equal(
            context.includes(marker!),
            scenario.expected.includes(name!),
          );
        return {
          stop_reason: "end_turn",
          content: [
            {
              type: "text",
              text: scenario.expected.includes("welcome-me")
                ? "> Welcome to our agent!\nExample"
                : "Example",
              citations: null,
            },
          ],
        };
      },
    });
    assert.deepEqual(result.activated.sort(), [...scenario.expected].sort());
  }
});
