import { test, expect } from "@playwright/test";
import { generateEmbedding } from "@/lib/ai";

test.describe("Together AI Embedding Generation", () => {
  test("should generate a valid embedding vector", async () => {
    // Generate an embedding for a simple test string
    const embedding = await generateEmbedding("Hello, world!");

    // Assert that the output is an array of numbers
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.every((val) => typeof val === "number")).toBe(true);

    // Assert that the vector has the correct dimensions for the model
    // baai/bge-large-en-v1.5 has 1024 dimensions
    expect(embedding.length).toBe(1024);
  });
});
