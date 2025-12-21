// Check if no duplicated contents are retrieved

import { describe, test, expect, afterAll } from "vitest";
import { ingestData } from "@/lib/ingestion";
import { generateEmbedding } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

describe("Retrieval Integration", () => {
  const TEST_URL = `https://example.com/test-retrieval-${Date.now()}`;
  const CONTENT = `
    # Retrieval Test Page
    This is a unique page created for testing retrieval accuracy and deduplication.
    It contains specific keywords like "unique_retrieval_keyword" to ensure we find it.
  `;

  test(
    "should retrieve relevant documents and ensure no duplicates",
    { timeout: 30000 },
    async () => {
      // 1. Ingest the document
      await ingestData(
        {
          url: TEST_URL,
          title: "Retrieval Test",
          content: CONTENT,
          description: "Test description",
          lastModified: new Date().toISOString(),
        },
        generateEmbedding,
        supabase
      );

      // 2. Ingest AGAIN to test deduplication
      await ingestData(
        {
          url: TEST_URL,
          title: "Retrieval Test",
          content: CONTENT,
          description: "Test description",
          lastModified: new Date().toISOString(),
        },
        generateEmbedding,
        supabase
      );

      // 3. Query
      const query = "unique_retrieval_keyword";
      const queryEmbedding = await generateEmbedding(query);
      const { data: matches, error } = await supabase.rpc("match_documents", {
        query_embedding: queryEmbedding,
        match_threshold: 0.1, // Low threshold to ensure we find it
        match_count: 10,
      });

      // 4. Precondition checks
      expect(error).toBeNull(); // database query should succeed
      expect(matches).toBeDefined(); // we got a response
      expect(matches!.length).toBeGreaterThan(0); // avoid passing the duplication check when there is no match at all
      const relevantMatches = matches!.filter((m) => m.url === TEST_URL);
      expect(relevantMatches.length).toBeGreaterThan(0); // ensure our ingested document is among the matches

      // 5. Check for duplicates: Map to "chunk_index" and ensure they are unique
      const chunkIndices = relevantMatches.map((m) => m.chunk_index);
      const uniqueIndices = new Set(chunkIndices);

      expect(uniqueIndices.size).toBe(chunkIndices.length);
    }
  );

  // Cleanup
  afterAll(async () => {
    await supabase.from("documents").delete().eq("url", TEST_URL);
  });
});
