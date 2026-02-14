import { NextRequest, NextResponse } from "next/server";
import { crawlWebsite } from "@/lib/crawler";
import { ingestData } from "@/lib/ingestion";
import { generateEmbedding } from "@/lib/ai";
import { supabase } from "@/lib/supabase";

// Allow the crawler to run for up to 60 seconds (max for Vercel Hobby)
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUrl = process.env.NEXT_PUBLIC_TARGET_URL;
  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_TARGET_URL environment variable" },
      { status: 500 },
    );
  }

  try {
    const limit = process.env.CRAWL_LIMIT
      ? parseInt(process.env.CRAWL_LIMIT)
      : 1000;
    // Start crawling with the ingestion callback
    const visited = await crawlWebsite(targetUrl, limit, async (page) => {
      console.log(`Ingesting page: ${page.url}`);
      await ingestData(page, generateEmbedding, supabase as any);
    });

    // Record the successful completion
    await supabase.from("crawl_status").insert({ completed_at: new Date() });

    return NextResponse.json({
      message: "Ingestion complete",
      visited: Array.from(visited),
    });
  } catch (error) {
    console.error("Ingestion failed:", error);
    return NextResponse.json(
      { error: "Failed to process ingestion request" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { baseUrl, limit = 45 } = await request.json();

    if (!baseUrl) {
      return NextResponse.json(
        { error: "baseUrl is required" },
        { status: 400 },
      );
    }

    // Start crawling with the ingestion callback
    const visited = await crawlWebsite(baseUrl, limit, async (page) => {
      console.log(`Ingesting page: ${page.url}`);
      await ingestData(page, generateEmbedding, supabase as any);
    });

    // Record the successful completion
    await supabase.from("crawl_status").insert({ completed_at: new Date() });

    return NextResponse.json({
      message: "Ingestion complete",
      visited: Array.from(visited),
    });
  } catch (error) {
    console.error("Ingestion failed:", error);
    return NextResponse.json(
      { error: "Failed to process ingestion request" },
      { status: 500 },
    );
  }
}
