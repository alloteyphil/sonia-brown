import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

export function ownerEmails(): string[] {
  return (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Only Sonia (and anyone she adds to OWNER_EMAILS) can use the dashboard.
 * Set it in the Convex dashboard: OWNER_EMAILS="sonia@example.com,assistant@example.com".
 * Without it, every dashboard call is denied, so no account can ever reach
 * booking data.
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
    throw new Error("This account isn't allowed to use the dashboard.");
  }
  return email;
}
