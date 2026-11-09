import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a real stack (Next.js + a Convex dev
 * deployment seeded with `npx convex run seed:run`).
 *   npm run dev         # in one terminal (with .env.local configured)
 *   npm run test:e2e    # in another
 * Point at a deployed preview with E2E_BASE_URL=https://... instead.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "mobile-chrome", use: { ...devices["Pixel 7"] } }],
});
