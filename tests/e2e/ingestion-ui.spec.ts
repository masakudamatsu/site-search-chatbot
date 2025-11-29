import { test, expect } from "@playwright/test";

test.describe("Ingestion UI", () => {
  const MOCKED_PAGE_COUNT = 10;

  test("should allow user to ingest a website and see status updates", async ({
    page,
  }) => {
    // Mock the API endpoint
    await page.route("/api/ingest", async (route) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: MOCKED_PAGE_COUNT }),
      });
    });

    await page.goto("/");

    // 1. Initial State
    const urlInput = page.getByPlaceholder("https://example.com");
    const loadButton = page.getByRole("button", { name: "Load" });
    await expect(urlInput).toBeVisible();
    await expect(loadButton).toBeEnabled();

    // 2. Trigger Ingestion
    await urlInput.fill("https://example.com");
    await loadButton.click();

    // 3. Loading State
    const loadingButton = page.getByRole("button", { name: "Loading..." });
    await expect(loadingButton).toBeDisabled();
    await expect(urlInput).toBeDisabled();
    await expect(
      page.getByText("Crawling and ingesting website...")
    ).toBeVisible();

    // 4. Final State
    await expect(
      page.getByText(`Ingestion complete! ${MOCKED_PAGE_COUNT} pages indexed.`)
    ).toBeVisible();

    // Input should be cleared and button re-enabled
    await expect(urlInput).toHaveValue("");
    await expect(loadButton).toBeEnabled();
  });

  test("should show an error message if ingestion fails", async ({ page }) => {
    // Mock a failed API response
    await page.route("/api/ingest", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to crawl the site." }),
      });
    });

    await page.goto("/");

    const urlInput = page.getByPlaceholder("https://example.com");
    const loadButton = page.getByRole("button", { name: "Load" });

    await urlInput.fill("https://invalid-url.com");
    await loadButton.click();

    await expect(
      page.getByText("Error: Failed to crawl the site.")
    ).toBeVisible();
    await expect(loadButton).toBeEnabled(); // Button should be re-enabled on failure
  });
});
