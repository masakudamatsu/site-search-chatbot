import { test, expect } from "@playwright/test";

test("homepage has correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Site Search Chatbot");
});

test("homepage displays site URL and LLM model", async ({ page }) => {
  await page.goto("/");

  const targetUrl = process.env.NEXT_PUBLIC_TARGET_URL;
  const chatModel = process.env.NEXT_PUBLIC_CHAT_MODEL;

  if (!targetUrl || !chatModel) {
    throw new Error(
      "NEXT_PUBLIC_TARGET_URL and NEXT_PUBLIC_CHAT_MODEL must be set in environment variables",
    );
  }

  await expect(page.getByText(targetUrl)).toBeVisible();
  await expect(page.getByText(chatModel)).toBeVisible();
});

test("homepage has noindex meta tag", async ({ page }) => {
  await page.goto("/");
  const metaRobots = page.locator('meta[name="robots"]');
  await expect(metaRobots).toHaveAttribute("content", "noindex, nofollow");
});
