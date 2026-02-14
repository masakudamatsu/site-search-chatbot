import { test, expect } from "@playwright/test";
import { supabase } from "@/lib/supabase";

test.describe("Metadata Display E2E", () => {
  let crawlId: number;
  // Use a date in the far future to ensure it's the latest record
  const futureDate = new Date("2099-01-01T12:00:00Z");

  // Force UTC timezone for predictable results
  test.use({ locale: "en-US", timezoneId: "UTC" });

  test.beforeAll(async () => {
    // Insert the test record
    const { data, error } = await supabase
      .from("crawl_status")
      .insert({ completed_at: futureDate.toISOString() })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert test crawl status: ${error.message}`);
    }
    crawlId = data.id;
  });

  test.afterAll(async () => {
    // Clean up the test record
    if (crawlId) {
      const { error } = await supabase
        .from("crawl_status")
        .delete()
        .eq("id", crawlId);
      if (error) {
        console.error(`Failed to clean up test crawl status: ${error.message}`);
      }
    }
  });

  test("should display the latest crawl date and time correctly", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify "Last crawled" label exists
    const label = page.getByText("Last crawled:");
    await expect(label).toBeVisible();

    // Find the timestamp element following the label
    // In our component, it's a span inside a p that also contains the text "Last crawled:"
    const timestampSpan = page
      .locator("p", { hasText: "Last crawled:" })
      .locator("span");

    // Log the actual text for debugging
    const actualText = await timestampSpan.innerText();
    console.log(`Actual displayed timestamp: "${actualText}"`);

    // Verify the date and time using a more flexible regex
    // This allows for minor variations in separators or AM/PM casing
    // Expected: Jan 1, 2099, 12:00 PM
    await expect(timestampSpan).toHaveText(/Jan 1, 2099/);
    await expect(timestampSpan).toHaveText(/12:00/);
    await expect(timestampSpan).toHaveText(/PM/i);
  });
});
