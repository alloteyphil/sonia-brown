import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// UI preview mode: `PREVIEW_MOCK=1 npm run dev` renders the booking flow and
// dashboard with fixture data, no Convex or Clerk needed. Off in production.
const preview = process.env.PREVIEW_MOCK === "1";

const nextConfig: NextConfig = {
  images: { dangerouslyAllowSVG: true, contentDispositionType: "inline" },
  turbopack: {
    ...(preview && {
      resolveAlias: {
        "convex/react": "./scripts/preview/mock-convex-react.tsx",
        "@clerk/nextjs": "./scripts/preview/mock-clerk.tsx",
        "convex/react-clerk": "./scripts/preview/mock-clerk.tsx",
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
