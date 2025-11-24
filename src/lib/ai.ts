import { embed } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";

if (!process.env.TOGETHER_AI_API_KEY) {
  throw new Error("Missing TOGETHER_AI_API_KEY environment variable");
}

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

// We use the specific model that matches our database schema (1024 dimensions)
export const embeddingModel = togetherai.textEmbeddingModel(
  "BAAI/bge-large-en-v1.5"
);

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}
