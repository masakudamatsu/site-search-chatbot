import { test, expect } from "@playwright/test";
import {
  generateEmbeddings,
  processPage,
  EmbeddingGenerator,
  ProcessedChunk,
} from "@/lib/ingestion";
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

test.describe("Data Ingestion - Embedding Generation", () => {
  test("should generate embeddings for chunks", async () => {
    // 1. Arrange: Prepare sample chunks
    const chunks: ProcessedChunk[] = [
      {
        content: "Hello world",
        metadata: {
          url: "http://test.com",
          title: "Test",
          description: "Desc",
          chunkIndex: 0,
        },
      },
      {
        content: "Second chunk",
        metadata: {
          url: "http://test.com",
          title: "Test",
          description: "Desc",
          chunkIndex: 1,
        },
      },
    ];

    // Create a mock generator that returns a fixed vector
    const mockGenerator: EmbeddingGenerator = async (text: string) => {
      // In a real test, we might check if 'text' is valid
      return [0.1, 0.2, 0.3];
    };

    // 2. Act: Generate embeddings
    const results = await generateEmbeddings(chunks, mockGenerator);

    // 3. Assert: Verify the results
    expect(results.length).toBe(2);

    // Check structure of first result
    expect(results[0].content).toBe(chunks[0].content);
    expect(results[0].embedding).toEqual(
      await mockGenerator(chunks[0].content)
    );
    expect(results[0].metadata).toEqual(chunks[0].metadata);

    // Check structure of second result
    expect(results[1].embedding).toEqual(
      await mockGenerator(chunks[1].content)
    );
  });
});
