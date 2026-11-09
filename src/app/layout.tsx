import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brand } from "@/brand/tokens";
import { Toaster } from "@/components/ui/toaster";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} · Private Chef & Catering in Accra`,
    template: `%s · ${brand.name}`,
  },
  description:
    "Book Sonia Brown, a private chef in Accra, for private dinners, weekly meal prep and event catering. Restaurant-quality food cooked at your table.",
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_GH",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0B2239",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH">
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
