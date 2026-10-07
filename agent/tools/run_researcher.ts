import { defineWorkflowTool } from "eve/tools";
import { z } from "zod";

const RESEARCHER_OUTPUT_SCHEMA = {
  additionalProperties: false,
  properties: {
    findings: {
      description:
        "One entry per verified factual claim; every entry carries at least one real source.",
      items: {
        additionalProperties: false,
        properties: {
          claim: {
            description:
              "A single, specific factual claim the caller can rely on.",
            type: "string",
          },
          confidence: {
            description:
              "'high' = multiple strong independent sources; 'low' = single or weaker source.",
            enum: ["high", "medium", "low"],
            type: "string",
          },
          notes: {
            description:
              "Caveats: date-sensitivity, scope limits, or where sources disagree.",
            type: "string",
          },
          sources: {
            description:
              "The real, fetched sources backing the claim; never empty, never invented.",
            items: {
              additionalProperties: false,
              properties: {
                title: {
                  description: "The source's title or publication name.",
                  type: "string",
                },
                url: {
                  description: "The source URL, as visited.",
                  type: "string",
                },
              },
              required: ["url", "title"],
              type: "object",
            },
            minItems: 1,
            type: "array",
          },
        },
        required: ["claim", "sources", "confidence", "notes"],
        type: "object",
      },
      type: "array",
    },
    gaps: {
      description:
        "What could not be found or verified; surfaced rather than guessed at.",
      items: { type: "string" },
      type: "array",
    },
    summary: {
      description:
        "A 1-3 sentence synthesis of what the research establishes, for the root to scan first.",
      type: "string",
    },
  },
  required: ["summary", "findings", "gaps"],
  type: "object",
} as const;

export default defineWorkflowTool({
  description:
    "Research a topic on the open web for facts, statistics, primary sources, and links the " +
    "caller doesn't already have. Return cited findings with confidence levels and any gaps " +
    "that could not be verified. The caller passes the question and known context in the message.",
  async execute({ message }, ctx) {
    "use workflow";
    const response = await ctx.agent("researcher").send(message, {
      outputSchema: RESEARCHER_OUTPUT_SCHEMA,
      signal: ctx.abortSignal,
    });
    const result = await response.result();
    if (result.status !== "completed" || result.data === undefined) {
      throw new Error(
        result.error?.message ?? "The researcher did not complete."
      );
    }
    return result.data;
  },
  inputSchema: z.object({ message: z.string() }),
});
