"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { ConvexOwnerProvider } from "@/components/providers/convex-owner";
import { Wordmark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  return (
    <ConvexOwnerProvider>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-gradient-to-b from-sky-mist to-cloud p-4">
        <Link href="/"><Wordmark /></Link>
        <SignInForm />
      </div>
    </ConvexOwnerProvider>
  );
}

function SignInForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setError(null);
    setPending(true);
    const { error } =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: String(form.get("name") ?? "").trim() || email });
    if (error) {
      setPending(false);
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    // Full navigation so the session cookie is on the next request (soft
    // client navigations can race the Set-Cookie and bounce back here).
    window.location.assign("/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-horizon bg-white p-7 shadow-sm">
      <div>
        <h1 className="font-display text-2xl">{mode === "sign-in" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "sign-in"
            ? "Owner dashboard — only allowlisted emails can open it."
            : "Anyone can create an account. Dashboard access still requires an owner email."}
        </p>
      </div>
      {mode === "sign-up" && (
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" />
        </Field>
      )}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password" hint={mode === "sign-up" ? "At least 10 characters." : undefined}>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={mode === "sign-up" ? 10 : undefined}
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
        />
      </Field>
      {error && <p role="alert" className="text-sm text-ember">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>
      <button
        type="button"
        onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null); }}
        className="w-full text-center text-sm text-muted hover:text-harbour"
      >
        {mode === "sign-in" ? "First time? Create your account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
