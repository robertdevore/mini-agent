export const cases = [
  {
    prompt: "I'm new to this project. What should I do?",
    expected: ["welcome-me"],
  },
  { prompt: "First day here. Where should I start?", expected: ["welcome-me"] },
  {
    prompt: "Generate release notes from recent commits",
    expected: ["wiki-changelog"],
  },
  {
    prompt: "Document this project's architecture",
    expected: ["documentation-readme"],
  },
  { prompt: "What's the weather?", expected: [] },
  { prompt: "What is 12 × 17?", expected: [] },
  {
    prompt: "Write a changelog and update project docs",
    expected: ["documentation-readme", "wiki-changelog"],
  },
  {
    prompt:
      "What does the name welcome-me mean? Discuss the name only; do not onboard me.",
    expected: [],
  },
];
