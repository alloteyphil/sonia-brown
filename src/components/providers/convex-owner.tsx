"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";

export function ConvexOwnerProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [client] = useState(() => (url ? new ConvexReactClient(url) : null));
  if (!client || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <h1 className="font-display text-3xl">Dashboard not configured</h1>
        <p className="mt-3 text-muted">
          Set <code>NEXT_PUBLIC_CONVEX_URL</code> and <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> (see README).
        </p>
      </div>
    );
  }
  return (
    <ClerkProvider
      appearance={{ variables: { colorPrimary: "#1C6DB5", borderRadius: "0.9rem" } }}
    >
      <ConvexProviderWithClerk client={client} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
