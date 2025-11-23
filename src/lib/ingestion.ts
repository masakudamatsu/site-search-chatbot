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
