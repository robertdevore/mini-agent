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

// Repository-specific regression checks for the owner's README samples.
// These recognize bounded English patterns, not arbitrary semantic errors.
export function readmeClaims(answer: string): Record<string, boolean> {
  const text = answer.replace(/[*_`]/g, "").replace(/\r/g, "");
  const paragraphs = text.split(/\n\s*\n/);
  const headerClaims = paragraphs.filter(p => /welcome-me/i.test(p) && /header|(?:first|exact) line/i.test(p));
  return {
    "offline and paid live tests distinguished":
      /offline tests/i.test(text) &&
      /(?:live[^\n]*(?:paid|API key|incurs|cost)|(?:paid|API key|incurs|cost)[^\n]*live)/i.test(text) &&
      !/(?<!offline )\btests and --list-skills work without/i.test(text),
    "welcome header explicitly scoped to activation":
      headerClaims.length > 0 && headerClaims.every(p => /(?:when|if|after|only)[^.!?]*activat/i.test(p)),
    "no inspection or editing commentary":
      !/\bI (?:did(?:n't| not)|have(?:n't| not)|read|inspected|found|used|assumed)\b/i.test(text) &&
      !/\b(?:add|insert|replace|fill in)[^.!?\n]{0,100}(?:here|your (?:email|contact)|if you want)/i.test(text),
    "no claim that activated skill contents were unread":
      !/(?:did(?:n't| not)|could(?:n't| not)) (?:read|inspect)[^.!?\n]*(?:\.skills|\.agents|skill (?:contents|bodies))/i.test(text),
  };
}
