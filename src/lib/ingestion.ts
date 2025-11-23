import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PageData } from "./crawler";

export interface ProcessedChunk {
  content: string;
  metadata: {
    url: string;
    title: string;
    description: string;
    lastModified?: string;
    chunkIndex: number;
  };
}

export async function processPage(data: PageData): Promise<ProcessedChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments(
    [data.content],
    [
      {
        url: data.url,
        title: data.title,
        description: data.description,
        lastModified: data.lastModified,
      },
    ]
  );

  return docs.map((doc, index) => ({
    content: doc.pageContent,
    metadata: {
      ...doc.metadata,
      chunkIndex: index,
    } as ProcessedChunk["metadata"],
  }));
}

export interface EmbeddingData extends ProcessedChunk {
  embedding: number[];
}

export type EmbeddingGenerator = (text: string) => Promise<number[]>;

export async function generateEmbeddings(
  chunks: ProcessedChunk[],
  generator: EmbeddingGenerator
): Promise<EmbeddingData[]> {
  const results: EmbeddingData[] = [];

  for (const chunk of chunks) {
    const embedding = await generator(chunk.content);
    results.push({
      ...chunk,
      embedding,
    });
  }

  return results;
}

export interface SupabaseClientInterface {
  from: (table: string) => {
    insert: (values: any[]) => Promise<{ error: any }>;
  };
}

export const TABLE_NAME = "documents";

export async function storeEmbeddings(
  data: EmbeddingData[],
  supabaseClient: SupabaseClientInterface
): Promise<void> {
  // Map the application data to the database schema
  const rows = data.map((item) => ({
    content: item.content,
    embedding: item.embedding,
    url: item.metadata.url,
    title: item.metadata.title,
    description: item.metadata.description,
    last_modified: item.metadata.lastModified,
    chunk_index: item.metadata.chunkIndex,
  }));

  const { error } = await supabaseClient.from(TABLE_NAME).insert(rows);

  if (error) {
    throw new Error(`Failed to store embeddings: ${error.message}`);
  }
}

export async function ingestData(
  page: PageData,
  generator: EmbeddingGenerator,
  client: SupabaseClientInterface
): Promise<void> {
  const chunks = await processPage(page);
  const embeddings = await generateEmbeddings(chunks, generator);
  await storeEmbeddings(embeddings, client);
}
