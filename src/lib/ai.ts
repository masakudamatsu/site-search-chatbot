import { InferenceClient } from "@huggingface/inference";
import { supabase } from "@/lib/supabase";

if (!process.env.HF_TOKEN) {
  throw new Error("Missing HF_TOKEN environment variable");
}

const client = new InferenceClient(process.env.HF_TOKEN);

// We use the model specified in the environment variables (defaulting to BAAI/bge-m3 if not set)
export const embeddingModel = process.env.EMBEDDING_MODEL || "BAAI/bge-m3";

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedding = await client.featureExtraction({
    model: embeddingModel,
    inputs: text,
  });

  // Ensure it's a flat array of numbers (featureExtraction can return nested arrays if multiple inputs)
  return Array.isArray(embedding) ? (embedding.flat() as number[]) : [];
}

export async function getRelevantContext(message: string): Promise<string> {
  // 1. Generate an embedding for the user's message
  const queryEmbedding = await generateEmbedding(message);

  // 2. Query the database for relevant documents
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: 10, // Return top 10 matches
  });

  if (error) {
    console.error("Error matching documents:", error);
    throw new Error(`Failed to match documents: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return "No relevant context found.";
  }

  // 3. Format the context into a single string to inject into the AI prompt
  // Note: Content already includes Title and URL from Context Enrichment in ingestion.ts
  return data.map((doc: any) => doc.content).join("\n\n---\n\n");
}
