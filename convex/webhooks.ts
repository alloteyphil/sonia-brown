import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { rateLimit } from "./lib/rateLimit";

export const throttle = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await rateLimit(ctx, key, 120, 60_000);
  },
});
