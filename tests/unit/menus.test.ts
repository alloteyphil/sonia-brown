import { describe, expect, it } from "vitest";
import { fallbackServices, findSampleMenu, menuSlug, sampleMenus } from "../../src/brand/content";

describe("sample menus", () => {
  it("belong to a real service", () => {
    const slugs = new Set(fallbackServices.map((s) => s.slug));
    for (const m of sampleMenus) expect(slugs, m.title).toContain(m.service);
  });

  it("have unique, URL-safe slugs that round-trip", () => {
    const seen = new Set<string>();
    for (const m of sampleMenus) {
      const slug = menuSlug(m.title);
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(seen.has(slug), slug).toBe(false);
      seen.add(slug);
      expect(findSampleMenu(slug)).toBe(m);
    }
    expect(menuSlug("Lean & Green")).toBe("lean-and-green");
  });

  it("ignores missing or unknown menu params", () => {
    expect(findSampleMenu(null)).toBeUndefined();
    expect(findSampleMenu("not-a-menu")).toBeUndefined();
  });
});
