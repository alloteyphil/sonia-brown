import { expect, test } from "@playwright/test";

/**
 * A guest books a private dinner on a phone using "pay later", then sees the
 * confirmation page. (The Paystack leg is covered by convex-test unit tests;
 * test it manually with Paystack test cards, see README.)
 */
test("guest can request a booking on mobile in under 2 minutes", async ({ page }) => {
  const started = Date.now();
  await page.goto("/");
  await page.getByRole("link", { name: "Book", exact: true }).first().click();

  await page.getByRole("button", { name: /Private Dinner/ }).click();
  await page.locator('button[aria-label$="available"]:not([disabled])').first().click();
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel(/Number of guests/).fill("4");
  await page.getByLabel("Where should I cook?").fill("12 Test Street, Osu, Accra");
  await page.getByLabel("Allergies & dietary needs").fill("No shellfish");
  await page.getByLabel("Full name").fill("E2E Guest");
  await page.getByLabel(/^Phone/).fill("024 000 0000");
  await page.getByLabel("Email").fill(`e2e+${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Review booking" }).click();

  await expect(page.getByRole("heading", { name: "Review and pay" })).toBeVisible();
  await page.getByText("Pay later / in person").click();
  await page.getByRole("button", { name: "Send booking request" }).click();

  await expect(page.getByRole("heading", { name: /Request received/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/^SB-[A-Z0-9]{6}$/)).toBeVisible();
  expect(Date.now() - started).toBeLessThan(120_000);
});
