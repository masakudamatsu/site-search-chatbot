import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/ingest/route";
import { NextRequest } from "next/server";
import { crawlWebsite } from "@/lib/crawler";

// Mock dependencies
vi.mock("@/lib/crawler", () => ({
  crawlWebsite: vi.fn(),
}));

vi.mock("@/lib/ingestion", () => ({
  ingestData: vi.fn(),
}));

vi.mock("@/lib/ai", () => ({
  generateEmbedding: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

describe("Ingest API (GET)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("should return 401 if Authorization header is missing", async () => {
    process.env.CRON_SECRET = "secret123";
    const req = new NextRequest("http://localhost/api/ingest");

    // @ts-ignore - GET might not exist yet
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test("should return 401 if Authorization header is invalid", async () => {
    process.env.CRON_SECRET = "secret123";
    const req = new NextRequest("http://localhost/api/ingest", {
      headers: { Authorization: "Bearer wrong-secret" },
    });

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test("should return 500 if NEXT_PUBLIC_TARGET_URL is missing", async () => {
    process.env.CRON_SECRET = "secret123";
    delete process.env.NEXT_PUBLIC_TARGET_URL;

    const req = new NextRequest("http://localhost/api/ingest", {
      headers: { Authorization: "Bearer secret123" },
    });

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Missing NEXT_PUBLIC_TARGET_URL");
  });

  test("should trigger crawling if authorized and configured", async () => {
    process.env.CRON_SECRET = "secret123";
    process.env.NEXT_PUBLIC_TARGET_URL = "http://example.com";

    // Mock crawlWebsite to return a Set
    (crawlWebsite as any).mockResolvedValue(new Set(["http://example.com"]));

    const req = new NextRequest("http://localhost/api/ingest", {
      headers: { Authorization: "Bearer secret123" },
    });

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(200);

    const expectedLimit = parseInt(process.env.CRAWL_LIMIT || "1000");
    const expectedSubdirectory =
      process.env.NEXT_PUBLIC_TARGET_URL_SUBDIRECTORY;

    expect(crawlWebsite).toHaveBeenCalledWith(
      "http://example.com",
      expectedLimit,
      expect.any(Function),
      expectedSubdirectory,
    );
  });
});
