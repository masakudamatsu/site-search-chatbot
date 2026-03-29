import { describe, test, expect, vi, beforeEach } from "vitest";
import * as aiLib from "@/lib/ai";
import { supabase } from "@/lib/supabase";
import { InferenceClient } from "@huggingface/inference";

// Mock the dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

// Use vi.hoisted to ensure the mock is available before vi.mock is called
const { mockFeatureExtraction } = vi.hoisted(() => ({
  mockFeatureExtraction: vi.fn(),
}));

// Mock the '@huggingface/inference' package
vi.mock("@huggingface/inference", () => {
  return {
    InferenceClient: vi.fn().mockImplementation(() => ({
      featureExtraction: mockFeatureExtraction,
    })),
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
      mockFeatureExtraction.mockResolvedValue(mockEmbedding);

      const embedding = await aiLib.generateEmbedding("Hello, world!");

      expect(mockFeatureExtraction).toHaveBeenCalledWith({
        model: expect.any(String),
        inputs: "Hello, world!",
      });
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
      const expectedOutput = `This is the first document.

---

This is the second document.`;

      // Mock InferenceClient to return a predictable embedding
      mockFeatureExtraction.mockResolvedValue(mockEmbedding);

      // Mock Supabase response
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockRpcData,
        error: null,
        status: 200,
        statusText: "OK",
        count: mockRpcData.length,
      });

      const context = await aiLib.getRelevantContext("What are the documents?");

      // Verify HF was called (proving generateEmbedding was called)
      expect(mockFeatureExtraction).toHaveBeenCalledWith({
        model: expect.any(String),
        inputs: "What are the documents?",
      });

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
      mockFeatureExtraction.mockResolvedValue(mockEmbedding);
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

      mockFeatureExtraction.mockResolvedValue(mockEmbedding);
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: mockError,
        status: 500,
        statusText: "Internal Server Error",
        count: null,
      });

      await expect(
        aiLib.getRelevantContext("Query that will fail"),
      ).rejects.toThrow(
        "Failed to match documents: Database connection failed",
      );
    });
  });
});
