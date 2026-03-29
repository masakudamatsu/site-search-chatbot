# Hugging Face Standards

This project uses Hugging Face for generating vector embeddings and hosting open-source LLM chat models.

## Embedding Generation

### Model
- **Default**: `BAAI/bge-m3`
- **Dimensions**: 1024
- **Context Window**: 8192 tokens

### Client
Use the `@huggingface/inference` library's `InferenceClient` for embedding generation.

```typescript
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedding = await client.featureExtraction({
    model: "BAAI/bge-m3",
    inputs: text,
  });
  return Array.isArray(embedding) ? (embedding.flat() as number[]) : [];
}
```

### Configuration
- `chunkSize`: 2000 characters
- `chunkOverlap`: 300 characters
- These settings are optimized for the 8192-token limit while maintaining retrieval precision.

## Chat Model Integration

### Provider
Use the Vercel AI SDK with the `@ai-sdk/openai` provider, configured to point to Hugging Face's OpenAI-compatible endpoint.

```typescript
import { createOpenAI } from "@ai-sdk/openai";

const hf = createOpenAI({
  baseURL: "https://router.huggingface.co/v1/",
  apiKey: process.env.HF_TOKEN,
});
```

### Model
- **Default**: `openai/gpt-oss-20b` (or any compatible model hosted on HF)
- Ensure the model name matches the Hugging Face model ID.

## Environment Variables
- `HF_TOKEN`: Required for both embeddings and chat.
- `EMBEDDING_MODEL`: Optional override for the embedding model.
- `NEXT_PUBLIC_CHAT_MODEL`: Optional override for the chat model.
