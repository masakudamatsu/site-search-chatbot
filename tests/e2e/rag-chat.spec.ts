import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";
import { ingestData } from "@/lib/ingestion";
import { generateEmbedding } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

const FIXTURE_PATH = path.join(
  process.cwd(),
  "tests/fixtures/steve_jobs_commencement.txt",
);

test.describe("RAG Chat Integration", () => {
  let testUrl: string;
  let uniqueId: string;

  test.beforeAll(async () => {
    const projectName = test.info().project.name;
    // 1. Set the test URL and read the fixture file
    uniqueId = `${projectName}-${Date.now()}-${Math.floor(
      Math.random() * 1000,
    )}`;
    testUrl = `https://example.com/test-steve-jobs-${uniqueId}`; // make sure parallel test runs won't interfere with each other

    const text = fs.readFileSync(FIXTURE_PATH, "utf-8");

    // 2. Ingest the data into Supabase
    // We use the real ingestion pipeline to ensure the data format is correct
    await ingestData(
      {
        url: testUrl,
        title: `Steve Jobs Commencement Speech [Test Run: ${uniqueId}]`, // We put the unique ID in the title instead of the content to verify Context Enrichment.
        content: text,
        description: "Steve Jobs's commencement speech at Stanford University",
        lastModified: new Date().toISOString(),
      },
      generateEmbedding,
      supabase as any,
    );
  });

  test.afterAll(async () => {
    // Clean up: Delete the test document
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("url", testUrl);

    if (error) {
      console.error("Failed to clean up test data:", error);
    }
  });
  // TODO: resolve the flakiness of this test
  test("should provide an answer based on the ingested content and cite the source", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Ask a specific question about the content
    // "Connecting the dots" is the first story in the speech
    const question = `What is the first story about in the speech marked [Test Run: ${uniqueId}]?`; // When the query contains a specific unique token (e.g., [Test Run: RUN-12345)), the document containing that exact same token will have a significantly higher similarity score than identical documents with different tokens (like RUN-67890). This effectively "filters" the results to the data owned by the current test worker, eliminating the race condition. For this specific test case, this strategy works because the answer to "What is the first story about?" is located at the very beginning of the speech.

    const sendButton = page.getByLabel("Send message");
    const searchForm = page.getByRole("search");
    const messageInput = searchForm.locator('input[type="text"]');

    await messageInput.fill(question);
    await sendButton.click();

    // 2. Wait for the response
    const messageList = page.getByRole("list");
    const aiMessage = messageList.getByRole("listitem").nth(1);

    // Wait for streaming to finish (or at least for text to appear)
    // We expect the answer to mention "connecting the dots"
    // We use a robust assertion because phrasing can vary (e.g. "connected the dots")
    await expect(aiMessage).toContainText(/connect.*dots/i, {
      timeout: 30000,
    }); // TODO: flaky test might need more time

    // 3. Verify the citation
    // We check for a link element with the correct href, as citations are now Markdown links
    const citationLink = aiMessage.getByRole("link");
    await expect(citationLink).toBeVisible();
    await expect(citationLink).toHaveAttribute("href", testUrl);

    // 4. Verify that the link opens in a new tab
    await expect(citationLink).toHaveAttribute("target", "_blank");
    await expect(citationLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
