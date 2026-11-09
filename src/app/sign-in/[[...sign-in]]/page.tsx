"use client";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ConvexOwnerProvider } from "@/components/providers/convex-owner";
import { Wordmark } from "@/components/site/logo";

export default function SignInPage() {
  return (
    <ConvexOwnerProvider>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-gradient-to-b from-sky-mist to-cloud p-4">
        <Link href="/"><Wordmark /></Link>
        <SignIn routing="path" path="/sign-in" forceRedirectUrl="/dashboard" />
      </div>
    </ConvexOwnerProvider>
  );
}
