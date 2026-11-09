import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/convex/**/*.test.ts"],
    environment: "node",
    server: { deps: { inline: ["convex-test"] } },
  },
});
