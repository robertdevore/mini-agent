import Anthropic from "@anthropic-ai/sdk";
import type { Model } from "./agent.js";
export function claude(): Model {
  if (!process.env.ANTHROPIC_API_KEY)
    throw new Error("Set ANTHROPIC_API_KEY before running a prompt");
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: 60000,
    maxRetries: 1,
  });
  return (request) => client.messages.create(request);
}
