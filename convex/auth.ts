import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import { ownerEmails } from "./lib/auth";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: process.env.SITE_URL,
    // Allow local LAN testing (phone on same Wi‑Fi) without changing SITE_URL.
    trustedOrigins: [
      process.env.SITE_URL!,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter(Boolean),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 10,
    },
    // Sign-up is open only to OWNER_EMAILS, so the public can't create accounts.
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!ownerEmails().includes(user.email.toLowerCase())) {
              throw new APIError("FORBIDDEN", { message: "Sign-ups are closed." });
            }
            return { data: user };
          },
        },
      },
    },
    plugins: [convex({ authConfig })],
  });
