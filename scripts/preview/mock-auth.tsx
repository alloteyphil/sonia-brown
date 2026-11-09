"use client";
import type { ReactNode } from "react";
export const ConvexBetterAuthProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
export const convexClient = () => ({ id: "convex" });
export const createAuthClient = () => ({
  signIn: { email: async () => ({ error: null }) },
  signUp: { email: async () => ({ error: null }) },
  signOut: async () => {},
});
