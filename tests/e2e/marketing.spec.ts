import { expect, test, type Page } from "@playwright/test";

async function clickFaq(page: Page) {
  const desktop = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "FAQ" });
  if (await desktop.isVisible()) {
    await desktop.click();
    return;
  }
  await page.getByRole("button", { name: /Open menu/i }).click();
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "FAQ" }).click();
}

async function faqClearsHeader(page: Page) {
  await expect
    .poll(async () => page.locator("#faq").evaluate((el) => el.getBoundingClientRect().top), {
      timeout: 8_000,
    })
    .toBeGreaterThan(56);
  await expect
    .poll(async () => page.locator("#faq").evaluate((el) => el.getBoundingClientRect().top), {
      timeout: 8_000,
    })
    .toBeLessThan(180);
}

test.describe("marketing site polish", () => {
  test("FAQ nav scrolls to the FAQ section from the home page", async ({ page }) => {
    await page.goto("/");
    await clickFaq(page);
    await expect(page).toHaveURL(/\/#faq$/);
    await expect(page.locator("#faq")).toBeInViewport({ ratio: 0.35 });
    await faqClearsHeader(page);
  });

  test("FAQ nav scrolls to the FAQ section from another page", async ({ page }) => {
    await page.goto("/about");
    await clickFaq(page);
    await expect(page).toHaveURL(/\/#faq$/);
    await expect(page.getByRole("heading", { name: "Good to know" })).toBeVisible();
    await expect(page.locator("#faq")).toBeInViewport({ ratio: 0.3 });
    await faqClearsHeader(page);
  });

  test("desktop hero sits text and food side by side in the first viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const hero = page.locator("main > section").first();
    const copy = hero.locator("h1");
    const photo = hero.locator("img").first();
    const primaryCta = hero.getByRole("link", { name: "Book Sonia" });

    await expect(copy).toBeVisible();
    await expect(photo).toBeVisible();
    await expect(primaryCta).toBeInViewport();

    const copyBox = await copy.boundingBox();
    const photoBox = await photo.boundingBox();
    expect(copyBox && photoBox).toBeTruthy();
    if (!copyBox || !photoBox) return;

    // Side-by-side: food sits to the right of the headline, both in the first screen.
    expect(photoBox.x).toBeGreaterThan(copyBox.x + copyBox.width - 40);
    expect(copyBox.y + copyBox.height).toBeLessThan(800);
    expect(photoBox.y).toBeLessThan(120);
    expect(photoBox.height).toBeGreaterThan(480);
    // Headline stays readable (not stuck at entrance opacity 0).
    await expect(copy).toHaveCSS("opacity", "1");
  });

  test("phone hero leads with the food photo", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const hero = page.locator("main > section").first();
    const copy = hero.locator("h1");
    const photo = hero.locator("img").first();

    const copyBox = await copy.boundingBox();
    const photoBox = await photo.boundingBox();
    expect(copyBox && photoBox).toBeTruthy();
    if (!copyBox || !photoBox) return;

    expect(photoBox.y).toBeLessThan(copyBox.y);
    expect(photoBox.width).toBeGreaterThan(300);
  });

  test("key pages render their main content", async ({ page }) => {
    for (const path of ["/", "/services", "/about", "/contact", "/book"]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      const mainBox = await page.locator("main").boundingBox();
      expect(mainBox?.height ?? 0).toBeGreaterThan(200);
    }
  });
});
