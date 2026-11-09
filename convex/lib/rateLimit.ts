import type { MutationCtx } from "../_generated/server";

/** Fixed-window rate limit stored in Convex (transactional, so it can't be raced). */
export async function rateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();
  if (!existing || now - existing.windowStart >= windowMs) {
    if (existing) await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    else await ctx.db.insert("rateLimits", { key, windowStart: now, count: 1 });
    return;
  }
  if (existing.count >= limit) {
    throw new Error("Too many requests. Please wait a few minutes and try again.");
  }
  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}
