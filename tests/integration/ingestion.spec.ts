import { test, expect } from "@playwright/test";
import {
  generateEmbeddings,
  processPage,
  storeEmbeddings,
  ingestData,
  EmbeddingData,
  EmbeddingGenerator,
  ProcessedChunk,
  SupabaseClientInterface,
  TABLE_NAME,
} from "@/lib/ingestion";
import { PageData } from "@/lib/crawler";
import fs from "fs";
import path from "path";

// --- Shared Test Data ---

const speechFilePath = path.join(
  __dirname,
  "../fixtures/steve_jobs_commencement.txt"
);
const speechContent = fs.readFileSync(speechFilePath, "utf-8");

const samplePage: PageData = {
  url: "https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says",
  title: "Steve Jobs 2005 Commencement Address",
  description:
    "Text of the Commencement address by Steve Jobs, CEO of Apple Computer and of Pixar Animation Studios, delivered on June 12, 2005.",
  content: speechContent,
};

const sampleChunks: ProcessedChunk[] = [
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

const sampleEmbeddingData: EmbeddingData[] = [
  {
    content: "Hello world",
    embedding: [0.1, 0.2, 0.3],
    metadata: {
      url: "http://test.com",
      title: "Test",
      description: "Desc",
      chunkIndex: 0,
    },
  },
];

// --- Mocks ---

const mockVector = [0.1, 0.2, 0.3];
const mockGenerator: EmbeddingGenerator = async () => mockVector;

// Factory function to create a fresh mock client for each test
function createMockSupabase() {
  let insertedData: any[] = [];
  let targetTable = "";

  const client: SupabaseClientInterface = {
    from: (table: string) => {
      targetTable = table;
      return {
        insert: async (data: any[]) => {
          insertedData = data;
          return { error: null };
        },
      };
    },
  };

  // Return the client and accessors for the captured data
  return {
    client,
    getInsertedData: () => insertedData,
    getTargetTable: () => targetTable,
  };
}

// --- Tests ---

test.describe("Data Ingestion Pipeline", () => {
  test("Step 1: Text Splitting", async () => {
    const chunks = await processPage(samplePage);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].metadata).toMatchObject({
      url: samplePage.url,
      title: samplePage.title,
      description: samplePage.description,
    });
  });

  test("Step 2: Embedding Generation", async () => {
    const results = await generateEmbeddings(sampleChunks, mockGenerator);

    expect(results.length).toBe(sampleChunks.length);

    expect(results[0].content).toBe(sampleChunks[0].content);
    expect(results[0].embedding).toEqual(mockVector);
    expect(results[0].metadata).toEqual(sampleChunks[0].metadata);

    expect(results[1].embedding).toEqual(mockVector);
  });

  test("Step 3: Database Storage", async () => {
    const { client, getInsertedData, getTargetTable } = createMockSupabase();

    await storeEmbeddings(sampleEmbeddingData, client);

    expect(getTargetTable()).toBe(TABLE_NAME);

    const insertedData = getInsertedData();
    expect(insertedData).toHaveLength(sampleEmbeddingData.length);

    const row = insertedData[0];
    expect(row.content).toBe(sampleEmbeddingData[0].content);
    expect(row.embedding).toEqual(sampleEmbeddingData[0].embedding);
    expect(row.url).toBe(sampleEmbeddingData[0].metadata.url);
  });

  test("Step 4: Full Integration", async () => {
    const { client, getInsertedData, getTargetTable } = createMockSupabase();

    await ingestData(samplePage, mockGenerator, client);

    expect(getTargetTable()).toBe(TABLE_NAME);

    const insertedData = getInsertedData();
    expect(insertedData.length).toBeGreaterThan(1);

    const firstRow = insertedData[0];
    expect(firstRow.url).toBe(samplePage.url);
    expect(firstRow.title).toBe(samplePage.title);
    expect(firstRow.embedding).toEqual(mockVector);
    expect(firstRow.content).toBeTruthy();
  });
});
