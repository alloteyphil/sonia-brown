"use client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

export function ConvexOwnerProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [client] = useState(() => (url ? new ConvexReactClient(url) : null));
  if (!client || !process.env.NEXT_PUBLIC_CONVEX_SITE_URL) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <h1 className="font-display text-3xl">Dashboard not configured</h1>
        <p className="mt-3 text-muted">
          Set <code>NEXT_PUBLIC_CONVEX_URL</code> and <code>NEXT_PUBLIC_CONVEX_SITE_URL</code> (see README).
        </p>
      </div>
    );
  }
  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
