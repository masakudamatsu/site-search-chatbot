import { test, expect } from "@playwright/test";
import { processPage } from "@/lib/ingestion";
import { PageData } from "@/lib/crawler";
import fs from "fs";
import path from "path";

test.describe("Data Ingestion - Text Splitting", () => {
  test("should split Steve Jobs speech into chunks", async () => {
    // 1. Arrange
    const filePath = path.join(
      __dirname,
      "../fixtures/steve_jobs_commencement.txt"
    );
    const speechContent = fs.readFileSync(filePath, "utf-8");

    const samplePage: PageData = {
      url: "https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says",
      title: "Steve Jobs 2005 Commencement Address",
      description:
        "Text of the Commencement address by Steve Jobs, CEO of Apple Computer and of Pixar Animation Studios, delivered on June 12, 2005.",
      content: speechContent,
    };

    // 2. Act
    const chunks = await processPage(samplePage);

    // 3. Assert
    expect(chunks.length).toBeGreaterThan(1); // It should definitely be more than one chunk!

    // Verify first chunk metadata
    expect(chunks[0].metadata).toMatchObject({
      url: samplePage.url,
      title: samplePage.title,
      description: samplePage.description,
    });
  });
});
