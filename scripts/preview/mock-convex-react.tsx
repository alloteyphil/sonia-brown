"use client";
/**
 * UI preview mode (PREVIEW_MOCK=1 npm run dev): replaces `convex/react` with
 * fixture data so the booking flow and dashboard can be designed without a
 * Convex deployment. Never used in production builds.
 */
import { getFunctionName } from "convex/server";
import type { ReactNode } from "react";
import { fixtures } from "./fixtures";

export class ConvexReactClient {
  constructor(public url: string) {}
}
export function ConvexProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function useConvexAuth() {
  return { isLoading: false, isAuthenticated: true };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useQuery(ref: any, args?: any) {
  if (args === "skip") return undefined;
  const name = getFunctionName(ref);
  const f = fixtures[name];
  return typeof f === "function" ? f(args ?? {}) : f;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutation(ref: any) {
  void ref;
  return async () => undefined;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAction(ref: any) {
  const name = getFunctionName(ref);
  return async () => {
    if (name === "bookings:start") throw new Error("Preview mode: bookings aren't saved.");
    return { paid: false };
  };
}
