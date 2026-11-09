import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

export function ownerEmails(): string[] {
  return (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Only emails listed in OWNER_EMAILS can use the dashboard.
 * Set it in the Convex dashboard:
 *   OWNER_EMAILS="sonia@example.com,assistant@example.com"
 *
 * Anyone else who signs up can authenticate, but every dashboard query and
 * mutation is denied here — no exceptions.
 */
export async function requireOwner(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Please sign in to continue.");

  const allowed = ownerEmails();
  const email = (identity.email ?? "").toLowerCase();

  if (allowed.length === 0) {
    throw new Error("Dashboard is locked: set OWNER_EMAILS in your Convex environment variables.");
  }
  if (!email || !allowed.includes(email)) {
    throw new Error(
      email
        ? `${email} is signed in, but only owner accounts can open the dashboard.`
        : "This account isn't allowed to use the dashboard.",
    );
  }
  return email;
}
