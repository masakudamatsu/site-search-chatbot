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
  supabase: {},
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

  test("should return 500 if TARGET_URL is missing", async () => {
    process.env.CRON_SECRET = "secret123";
    delete process.env.TARGET_URL;

    const req = new NextRequest("http://localhost/api/ingest", {
      headers: { Authorization: "Bearer secret123" },
    });

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Missing TARGET_URL");
  });

  test("should trigger crawling if authorized and configured", async () => {
    process.env.CRON_SECRET = "secret123";
    process.env.TARGET_URL = "http://example.com";

    // Mock crawlWebsite to return a Set
    (crawlWebsite as any).mockResolvedValue(new Set(["http://example.com"]));

    const req = new NextRequest("http://localhost/api/ingest", {
      headers: { Authorization: "Bearer secret123" },
    });

    // @ts-ignore
    const res = await GET(req);
    expect(res.status).toBe(200);

    expect(crawlWebsite).toHaveBeenCalledWith(
      "http://example.com",
      1000,
      expect.any(Function)
    );
  });
});
