"use client";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-GH">
      <body className="min-h-dvh bg-cloud">
        <title>Something went wrong · Sonia Brown</title>
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-sm font-semibold tracking-[0.3em] text-harbour">Error</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Something went wrong</h1>
          <p className="mt-4 text-lg text-muted">The site couldn&apos;t load. Please try again in a moment.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-11 items-center rounded-full bg-harbour px-5 font-semibold text-white hover:bg-harbour-deep"
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the router may be broken here */}
            <a href="/" className="inline-flex h-11 items-center rounded-full border border-horizon bg-white px-5 font-semibold">
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
