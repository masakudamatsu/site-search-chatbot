import { describe, test, expect, vi, beforeEach } from "vitest";
import * as aiLib from "@/lib/ai";
import { supabase } from "@/lib/supabase";
import { embed } from "ai";

// Mock the dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Mock the 'ai' package to intercept the 'embed' call
vi.mock("ai", async (importOriginal) => {
  const original = await importOriginal<typeof import("ai")>();
  return {
    ...original,
    embed: vi.fn(),
  };
});

describe("AI Library", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe("generateEmbedding", () => {
    test("should generate a valid embedding vector", async () => {
      const mockEmbedding = Array(1024).fill(0.1);
      vi.mocked(embed).mockResolvedValue({ embedding: mockEmbedding } as any);

      const embedding = await aiLib.generateEmbedding("Hello, world!");

      expect(embed).toHaveBeenCalledWith(
        expect.objectContaining({
          value: "Hello, world!",
        })
      );
      expect(embedding).toEqual(mockEmbedding);
    });
  });

  describe("getRelevantContext", () => {
    test("should return formatted context from mocked data", async () => {
      const mockEmbedding = Array(1024).fill(0.1);
      const mockRpcData = [
        {
          content: "This is the first document.",
          url: "https://example.com/page1",
        },
        {
          content: "This is the second document.",
          url: "https://example.com/page2",
        },
      ];
      const expectedOutput = `###Source URL: https://example.com/page1
This is the first document.

---

###Source URL: https://example.com/page2
This is the second document.`;

      // Mock embed to return a predictable embedding
      vi.mocked(embed).mockResolvedValue({ embedding: mockEmbedding } as any);

      // Mock Supabase response
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockRpcData,
        error: null,
        status: 200,
        statusText: "OK",
        count: mockRpcData.length,
      });

      const context = await aiLib.getRelevantContext("What are the documents?");

      // Verify embed was called (proving generateEmbedding was called)
      expect(embed).toHaveBeenCalledWith(
        expect.objectContaining({
          value: "What are the documents?",
        })
      );

      // Verify Supabase RPC was called with the mocked embedding
      expect(supabase.rpc).toHaveBeenCalledWith("match_documents", {
        query_embedding: mockEmbedding,
        match_threshold: 0.5,
        match_count: 10,
      });

      expect(context.trim()).toBe(expectedOutput.trim());
    });

    test("should handle no documents found", async () => {
      const mockEmbedding = Array(1024).fill(0.2);
      vi.mocked(embed).mockResolvedValue({ embedding: mockEmbedding } as any);
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
        status: 200,
        statusText: "OK",
        count: 0,
      });

      const context = await aiLib.getRelevantContext("No matching query");

      expect(context).toBe("No relevant context found.");
    });

    test("should throw an error if the RPC fails", async () => {
      const mockEmbedding = Array(1024).fill(0.3);
      const mockError = {
        message: "Database connection failed",
        details: "The database is not reachable.",
        hint: "Check the connection string.",
        code: "500",
        name: "PostgrestError",
      };

      vi.mocked(embed).mockResolvedValue({ embedding: mockEmbedding } as any);
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: mockError,
        status: 500,
        statusText: "Internal Server Error",
        count: null,
      });

      await expect(
        aiLib.getRelevantContext("Query that will fail")
      ).rejects.toThrow(
        "Failed to match documents: Database connection failed"
      );
    });
  });
});
