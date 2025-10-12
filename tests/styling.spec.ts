import { test, expect } from "@playwright/test";

test("homepage h1 has correct font size", async ({ page }) => {
  await page.goto("/");
  const h1 = page.locator("h1");
  await expect(h1).toHaveCSS("font-size", "36px");
});
