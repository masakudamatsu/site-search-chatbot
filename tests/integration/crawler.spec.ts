import { test, expect } from "@playwright/test";
import { crawlPage } from "@/lib/crawler";

test("should crawl a single page and extract its content", async () => {
  // For this initial test, we can use a simple, reliable page.
  // We'll make this more robust later.
  const url = "https://www.google.com";
  const content = await crawlPage(url);

  expect(typeof content).toBe("string");
  expect(content.length).toBeGreaterThan(0);
});
