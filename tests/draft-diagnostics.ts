import { MAX_OUTPUT_TOKENS, type Model } from "../src/agent.js";

// Only fixed labels and bounded numeric metadata may leave the model boundary.
export function diagnosticModel(model: Model, events: string[]): Model {
  return async request => {
    try {
      const response = await model(request);
      const reasons = ["end_turn", "tool_use", "max_tokens", "stop_sequence", "pause_turn", "refusal"];
      const reason = reasons.includes(response.stop_reason ?? "") ? response.stop_reason : "unknown";
      events.push(`Model turn ${events.length + 1}: stop_reason=${reason}`);
      return response;
    } catch (error) {
      const status = (error as { status?: unknown } | null)?.status;
      const name = (error as { name?: unknown } | null)?.name;
      const kind = name === "APIConnectionTimeoutError" ? "timeout" : name === "APIConnectionError" ? "connection" : "request";
      events.push(`Model failure: ${kind}${typeof status === "number" && Number.isInteger(status) && status >= 400 && status <= 599 ? `; HTTP ${status}` : ""}`);
      throw error;
    }
  };
}

export function draftFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const known = [
    `Claude reached the ${MAX_OUTPUT_TOKENS}-token output limit; no partial answer accepted. Request a shorter document or narrower scope.`,
    "Claude request failed. Check API credentials, model access, and connectivity.",
    "Claude response incomplete or refused; no final answer accepted",
    "Agent step limit reached without a final response",
    "Claude returned an empty response",
    "Unexpected tool calls in final response",
    "Invalid tool call batch",
    "Welcome skill response failed the exact first-line header requirement",
  ];
  return known.includes(message) ? message : "Local discovery, repository inspection, or draft-check failure; run offline tests and --list-skills for diagnostics.";
}
