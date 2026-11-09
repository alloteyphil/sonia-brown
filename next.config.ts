import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// UI preview mode: `PREVIEW_MOCK=1 npm run dev` renders the booking flow and
// dashboard with fixture data, no Convex or auth backend needed. Off in production.
const preview = process.env.PREVIEW_MOCK === "1";

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi use the dev server (HMR, dev assets).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
  images: { dangerouslyAllowSVG: true, contentDispositionType: "inline" },
  turbopack: {
    ...(preview && {
      resolveAlias: {
        "convex/react": "./scripts/preview/mock-convex-react.tsx",
        "@convex-dev/better-auth/react": "./scripts/preview/mock-auth.tsx",
        "@convex-dev/better-auth/client/plugins": "./scripts/preview/mock-auth.tsx",
        "better-auth/react": "./scripts/preview/mock-auth.tsx",
      },
    }),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
