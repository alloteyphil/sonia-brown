import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboard = createRouteMatcher(["/dashboard(.*)"]);
const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

const withClerk = clerkMiddleware(async (auth, req) => {
  if (isDashboard(req)) await auth.protect();
});

/**
 * Protects /dashboard with Clerk. Data access is also enforced server-side in
 * Convex (requireOwner + OWNER_EMAILS), so this is defence in depth.
 */
export default clerkConfigured ? withClerk : () => NextResponse.next();

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in/:path*"],
};
