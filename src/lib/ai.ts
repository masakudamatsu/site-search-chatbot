import { embed } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { supabase } from "@/lib/supabase";

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

export async function getRelevantContext(message: string): Promise<string> {
  // 1. Generate an embedding for the user's message
  const queryEmbedding = await generateEmbedding(message);

  // 2. Query the database for relevant documents
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: 5, // Return top 5 matches
  });

  if (error) {
    console.error("Error matching documents:", error);
    throw new Error(`Failed to match documents: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return "No relevant context found.";
  }

  // 3. Format the context into a single string to inject into the AI prompt
  return data
    .map((doc: any) => `###Source URL: ${doc.metadata.url}\n${doc.content}`)
    .join("\n\n---\n\n");
}
