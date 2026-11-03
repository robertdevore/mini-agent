// Narrow English-pattern checks; absence of a recognized claim is not proof of quality.
export function changelogClaims(answer: string, hashes: string[]): Record<string, boolean> {
  const counts = [...answer.matchAll(/\b(?:covers?|covering|returned)\s+(?:the\s+)?(\d+)\s+commits\b/gi)]
    .map(match => Number(match[1]));
  const citations = [...answer.matchAll(/https:\/\/github\.com\/robertdevore\/mini-agent\/commit\/([a-f0-9]{7,64})\b/g)]
    .map(match => match[1]!);
  return {
    "recognized commit-count claims match history": counts.every(count => count === hashes.length),
    "commit citations resolve within returned history": citations.length > 0 && citations.every(citation => hashes.filter(hash => hash.startsWith(citation)).length === 1),
  };
}
