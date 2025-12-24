import { describe, test, expect, vi, beforeEach } from "vitest";
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
import { createHash } from "crypto";

// --- Shared Test Data ---

const speechFilePath = path.join(
  process.cwd(), // Use process.cwd() instead of __dirname for Vitest compatibility context
  "tests/fixtures/steve_jobs_commencement.txt"
);
// Ensure we handle file reading correctly in the test environment
const speechContent = fs.existsSync(speechFilePath)
  ? fs.readFileSync(speechFilePath, "utf-8")
  : "Dummy content";

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
// Mock generator function
const mockGenerator: EmbeddingGenerator = async () => mockVector;

// Helper to create fresh mocks
const createMockSupabaseClient = () => {
  const insertMock = vi.fn().mockResolvedValue({ error: null });
  const eqMock = vi.fn().mockResolvedValue({ error: null });
  const deleteMock = vi.fn().mockReturnValue({ eq: eqMock });
  const singleMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const selectEqMock = vi.fn().mockReturnValue({ single: singleMock });
  const selectMock = vi.fn().mockReturnValue({ eq: selectEqMock });
  const upsertMock = vi.fn().mockResolvedValue({ error: null });

  const client: SupabaseClientInterface = {
    from: vi.fn().mockReturnValue({
      insert: insertMock,
      delete: deleteMock,
      select: selectMock, // For checking existing page
      upsert: upsertMock, // For updating crawl status
    }),
  };

  return { client, insertMock, eqMock, deleteMock, singleMock, upsertMock };
};

describe("Ingestion Pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    // Spy on the generator to verify calls
    const generatorSpy = vi.fn().mockResolvedValue(mockVector);
    const results = await generateEmbeddings(sampleChunks, generatorSpy);

    expect(results).toHaveLength(sampleChunks.length);
    expect(results[0].content).toBe(sampleChunks[0].content);
    expect(results[0].embedding).toEqual(mockVector);
    expect(results[0].metadata).toEqual(sampleChunks[0].metadata);

    expect(results[1].embedding).toEqual(mockVector);
    expect(generatorSpy).toHaveBeenCalledTimes(sampleChunks.length);
  });

  test("Step 3: Database Storage", async () => {
    const { client, insertMock } = createMockSupabaseClient();

    await storeEmbeddings(sampleEmbeddingData, client);

    // Verify correct table was targeted
    expect(client.from).toHaveBeenCalledWith(TABLE_NAME);

    // Get the arguments of the first call to insert()
    // insertMock.mock.calls[0] is the array of arguments for the first call
    // insertMock.mock.calls[0][0] is the first argument (the data array)
    const insertedData = insertMock.mock.calls[0][0];

    // Assertions matching the original test exactly
    expect(insertedData).toHaveLength(sampleEmbeddingData.length);
    expect(insertedData[0]).toMatchObject({
      content: sampleEmbeddingData[0].content,
      embedding: sampleEmbeddingData[0].embedding,
      url: sampleEmbeddingData[0].metadata.url,
    });
  });

  test("Step 3b: Database Storage (Deduplication)", async () => {
    const { client, deleteMock, eqMock } = createMockSupabaseClient();

    await storeEmbeddings(sampleEmbeddingData, client);

    // Verify that delete was called on the table
    expect(client.from).toHaveBeenCalledWith(TABLE_NAME);
    expect(deleteMock).toHaveBeenCalled();

    // Verify that eq was called with the correct column and URL
    expect(eqMock).toHaveBeenCalledWith(
      "url",
      sampleEmbeddingData[0].metadata.url
    );
  });

  test("Step 4: Full Integration", async () => {
    const { client, insertMock, deleteMock } = createMockSupabaseClient();

    await ingestData(samplePage, mockGenerator, client);

    // // Verify deduplication occurred
    // expect(deleteMock).toHaveBeenCalled();

    // 1. Verify Table Name
    expect(client.from).toHaveBeenCalledWith(TABLE_NAME);

    // 2. Capture and Verify Inserted Data
    // Get the array passed to the first call of insert()
    const insertedData = insertMock.mock.calls[0][0];

    expect(insertedData.length).toBeGreaterThan(1);

    const firstRow = insertedData[0];
    expect(firstRow.url).toBe(samplePage.url);
    expect(firstRow.title).toBe(samplePage.title);
    expect(firstRow.embedding).toEqual(mockVector);
    expect(firstRow.content).toBeTruthy();
  });
});

describe("Smart Ingestion Logic", () => {
  test("should skip ingestion if Last-Modified header matches", async () => {
    const { client, insertMock, singleMock } = createMockSupabaseClient();
    const pageWithDate = {
      ...samplePage,
      lastModified: "Wed, 21 Oct 2015 07:28:00 GMT",
    };
    // Calculate expected hash for the sample content
    const hash = createHash("sha256").update(samplePage.content).digest("hex");
    // Mock existing record in 'crawled_pages' with the SAME date and hash
    singleMock.mockResolvedValue({
      data: {
        last_modified: pageWithDate.lastModified,
        content_hash: hash,
      },
      error: null,
    });

    await ingestData(pageWithDate, mockGenerator, client);

    // Verify we checked the tracking table
    expect(client.from).toHaveBeenCalledWith("crawled_pages");

    // Verify we skipped the expensive embedding/insertion step
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("should skip ingestion if content hash matches (even if date differs)", async () => {
    const { client, insertMock, singleMock } = createMockSupabaseClient();

    // Calculate expected hash for the sample content
    const hash = createHash("sha256").update(samplePage.content).digest("hex");

    // Mock existing record with SAME hash but DIFFERENT date
    singleMock.mockResolvedValue({
      data: {
        last_modified: "Old Date",
        content_hash: hash,
      },
      error: null,
    });

    await ingestData(samplePage, mockGenerator, client);

    // Should still skip because content is identical
    expect(insertMock).not.toHaveBeenCalled();
  });

  test("should proceed and update crawl status if it is a new page", async () => {
    const { client, insertMock, upsertMock, singleMock } =
      createMockSupabaseClient();

    // Mock NO existing record (new page) or mismatched data
    singleMock.mockResolvedValue({ data: null, error: null });

    await ingestData(samplePage, mockGenerator, client);

    // 1. Should insert embeddings (process happened)
    expect(insertMock).toHaveBeenCalled();

    // 2. Should update crawled_pages with new state
    expect(upsertMock).toHaveBeenCalled();

    // Verify the update payload
    const upsertArgs = upsertMock.mock.calls[0][0];
    expect(upsertArgs.url).toBe(samplePage.url);
    expect(upsertArgs.content_hash).toBeDefined();
    expect(upsertArgs.last_crawled_at).toBeDefined();
  });

  test("should proceed and update crawl status if content changed", async () => {
    const { client, insertMock, upsertMock, singleMock } =
      createMockSupabaseClient();

    // Mock changed contents
    singleMock.mockResolvedValue({
      data: {
        last_modified: "Old Date",
        content_hash: "DifferentHash",
      },
      error: null,
    });
    await ingestData(samplePage, mockGenerator, client);

    // 1. Should insert embeddings (process happened)
    expect(insertMock).toHaveBeenCalled();

    // 2. Should update crawled_pages with new state
    expect(upsertMock).toHaveBeenCalled();

    // Verify the update payload
    const upsertArgs = upsertMock.mock.calls[0][0];
    expect(upsertArgs.url).toBe(samplePage.url);
    expect(upsertArgs.content_hash).toBeDefined();
    expect(upsertArgs.last_crawled_at).toBeDefined();
  });
});
