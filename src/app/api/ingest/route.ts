import { NextResponse } from "next/server";
import { crawlWebsite } from "@/lib/crawler";
import { ingestData } from "@/lib/ingestion";
import { generateEmbedding } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { baseUrl, limit = 10 } = await request.json();

    if (!baseUrl) {
      return NextResponse.json(
        { error: "baseUrl is required" },
        { status: 400 }
      );
    }

    // Start crawling with the ingestion callback
    const visited = await crawlWebsite(baseUrl, limit, async (page) => {
      console.log(`Ingesting page: ${page.url}`);
      await ingestData(page, generateEmbedding, supabase);
    });

    return NextResponse.json({
      message: "Ingestion complete",
      visited: Array.from(visited),
    });
  } catch (error) {
    console.error("Ingestion failed:", error);
    return NextResponse.json(
      { error: "Failed to process ingestion request" },
      { status: 500 }
    );
  }
}
