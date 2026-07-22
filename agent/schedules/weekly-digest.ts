import { defineSchedule } from "eve/schedules";
import { requireEnv } from "../lib/constants.js";

const digestRepo = requireEnv("DIGEST_REPO", "acme/widgets");
const digestEmail = requireEnv("DIGEST_EMAIL", "team@acme.com");
const fromAddress = requireEnv("RESEND_FROM_ADDRESS", "kody@yourdomain.com");

/**
 * Weekly GitHub issues digest, composed by the agent and sent with the Resend
 * MCP connection's email tools.
 *
 * @remarks
 * - Fires every Monday at 09:00 UTC (`"0 9 * * 1"`); on Vercel each schedule
 *   becomes a Vercel Cron Job and the expression is evaluated in UTC.
 * - Runs in markdown task mode: the agent sends the email itself through the
 *   `resend` connection, which gives it control of the subject line. The
 *   chat-sdk Resend channel cannot set a subject on outbound-initiated
 *   threads (`@resend/chat-sdk-adapter` 0.2.2 hardcodes "New message"), so
 *   delivery does not go through the channel; replies to the digest still
 *   reach the agent through the channel's inbound webhook.
 * - The from-address line repeats the standing instruction injected by
 *   `agent/instructions.ts`; the duplication is deliberate so
 *   the cron session carries the constraint in its own prompt.
 * - The digest's structure and formatting rules live in the `digest-format`
 *   skill; the prompt only carries what the skill cannot know (repo,
 *   recipient, sender, subject, and the fetch-fresh rule).
 * - `DIGEST_REPO`, `DIGEST_EMAIL`, and `RESEND_FROM_ADDRESS` are required at
 *   module load via {@link requireEnv}, so a missing value fails discovery
 *   instead of producing a schedule that cannot send.
 */
export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: [
    `Fetch all open issues on ${digestRepo} using the GitHub tools, compose this week's issues digest, and email it to ${digestEmail} using the Resend email tools.`,
    `Send from ${fromAddress}. Never send from any other address.`,
    "Fetch the issues fresh in this run; never reuse counts or lists from earlier context.",
    `Subject line: "Weekly issues digest: ${digestRepo}" followed by the date. The body is the digest itself, with no preamble or commentary about the task.`,
    "Load the digest-format skill and follow it for the digest's structure: the grouping, one-line issue summaries, citations, overview, and the closing invitation to reply.",
  ].join("\n\n"),
});
