import { defineAgent } from "eve";

/**
 * Root agent runtime configuration.
 *
 * @remarks
 * Sets the model and the session budget for Kody, the GitHub maintainer agent; the rest of the
 * agent's surface (channels, connections, tools, skills, subagents) is discovered from the
 * filesystem under `agent/`. Conversation history is compacted once it reaches 75% of the context
 * window, and the per-session output token limit caps runaway sessions. `@vercel/connect` is
 * externalized from the build as a temporary workaround until eve handles transitive Connect
 * imports from `@github-tools/sdk` without configuration.
 */
export default defineAgent({
  build: { externalDependencies: ["@vercel/connect"] },
  compaction: { thresholdPercent: 0.75 },
  limits: {
    maxOutputTokensPerSession: 20_000,
  },
  model: "anthropic/claude-fable-5",
});
