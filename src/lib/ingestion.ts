import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PageData } from "./crawler";
import { createHash } from "crypto"; // Import crypto for hashing

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
    chunkSize: 300,
    chunkOverlap: 50,
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
    ],
  );

  return docs.map((doc, index) => {
    // Context Enrichment: Prepend Title and URL to the content
    // This helps the embedding model maintain semantic context even for small chunks.
    const enrichedContent = `Title: ${doc.metadata.title}\nURL: ${doc.metadata.url}\n\n${doc.pageContent}`;

    return {
      content: enrichedContent,
      metadata: {
        ...doc.metadata,
        chunkIndex: index,
      } as ProcessedChunk["metadata"],
    };
  });
}

export interface EmbeddingData extends ProcessedChunk {
  embedding: number[];
}

export type EmbeddingGenerator = (text: string) => Promise<number[]>;

export async function generateEmbeddings(
  chunks: ProcessedChunk[],
  generator: EmbeddingGenerator,
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

// Updated interface to support 'select', 'single', and 'upsert'
export interface SupabaseClientInterface {
  from: (table: string) => {
    insert: (values: any[]) => PromiseLike<{ error: any }>;
    delete: () => {
      eq: (column: string, value: any) => PromiseLike<{ error: any }>;
    };
    select: (columns: string) => {
      eq: (
        column: string,
        value: any,
      ) => {
        single: () => PromiseLike<{ data: any; error: any }>;
      };
    };
    upsert: (values: any) => PromiseLike<{ error: any }>;
  };
}

export const TABLE_NAME = "documents";
export const CRAWLED_PAGES_TABLE = "crawled_pages";

export function computeChecksum(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export async function shouldIngestPage(
  page: PageData,
  client: SupabaseClientInterface,
): Promise<boolean> {
  // Check if we have an existing record for this URL
  const { data, error } = await client
    .from(CRAWLED_PAGES_TABLE)
    .select("*")
    .eq("url", page.url)
    .single();

  // If no record exists or error, default to ingesting
  if (error || !data) {
    return true;
  }

  // 1. Date Check: If lastModified header matches stored value, skip.
  if (
    page.lastModified &&
    data.last_modified &&
    page.lastModified === data.last_modified
  ) {
    return false;
  }

  // 2. Checksum Check: If content hash matches, skip.
  const currentHash = computeChecksum(page.content);
  if (data.content_hash === currentHash) {
    return false;
  }

  return true;
}

export async function storeEmbeddings(
  data: EmbeddingData[],
  supabaseClient: SupabaseClientInterface,
): Promise<void> {
  if (data.length === 0) return;

  const url = data[0].metadata.url;

  // Delete existing embeddings for this URL to avoid duplicates
  const { error: deleteError } = await supabaseClient
    .from(TABLE_NAME)
    .delete()
    .eq("url", url);

  if (deleteError) {
    throw new Error(
      `Failed to delete existing embeddings: ${deleteError.message}`,
    );
  }

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

export async function updateCrawledPage(
  page: PageData,
  client: SupabaseClientInterface,
): Promise<void> {
  const content_hash = computeChecksum(page.content);

  // Upsert the record in crawled_pages
  const { error } = await client.from(CRAWLED_PAGES_TABLE).upsert({
    url: page.url,
    last_modified: page.lastModified,
    content_hash,
    last_crawled_at: new Date().toISOString(),
  });

  if (error) {
    console.warn(`Failed to update crawled_pages for ${page.url}:`, error);
  }
}

export async function ingestData(
  page: PageData,
  generator: EmbeddingGenerator,
  client: SupabaseClientInterface,
): Promise<void> {
  // 1. Smart Check
  const shouldIngest = await shouldIngestPage(page, client);
  if (!shouldIngest) {
    console.log(`Skipping unchanged page: ${page.url}`);
    // Even if we skip, we might want to touch 'last_crawled_at'.
    // For now, we skip entirely to save DB calls.
    return;
  }

  // 2. Process & Embed
  const chunks = await processPage(page);
  const embeddings = await generateEmbeddings(chunks, generator);

  // 3. Store Data
  await storeEmbeddings(embeddings, client);

  // 4. Update Tracking Table
  await updateCrawledPage(page, client);
}
