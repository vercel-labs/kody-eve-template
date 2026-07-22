import { connectGithubTools } from "@github-tools/sdk/connect/eve";

const githubConnector = process.env.GITHUB_CONNECTOR ?? "github/kody-agent";

/**
 * GitHub tool set for reading and triaging issues.
 *
 * @remarks
 * Registers the GitHub Tools SDK's `maintainer` preset via Vercel Connect. Scopes are derived
 * from the preset, and tokens are minted lazily inside each tool's execute call, so nothing
 * authenticates at import or build time. The connector UID comes from the `GITHUB_CONNECTOR`
 * environment variable, the same one the GitHub channel reads; the fallback here is this
 * project's own connector UID.
 *
 * Issue-conversation writes (comments, issue create/close, labels) run without approval: they are
 * reversible actions on the configured repo, and the email surface cannot render an approval
 * prompt, so a gate there would strand the session. Higher-impact writes (merging PRs, pushing
 * files, repo creation) keep the SDK's approval-by-default.
 */
export default connectGithubTools(githubConnector, {
  preset: "maintainer",
  requireApproval: {
    addIssueComment: "never",
    addLabels: "never",
    closeIssue: "never",
    createIssue: "never",
    removeLabel: "never",
  },
});
