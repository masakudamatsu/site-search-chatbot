import { describe, test, expect, vi, beforeEach } from "vitest";
import { crawlPage, extractLinks } from "@/lib/crawler";

// Define mocks that are hoisted to the top of the file
const mocks = vi.hoisted(() => {
  const goto = vi.fn();
  const evaluate = vi.fn();
  const close = vi.fn();
  const url = vi.fn(); // just for completeness
  const title = vi.fn();
  const newPage = vi.fn();

  const page = {
    goto,
    evaluate,
    close,
    url, // just for completeness
    title,
  };

  const browser = {
    newPage,
    close: vi.fn(),
  };

  return {
    goto,
    evaluate,
    close,
    url,
    title,
    newPage,
    page,
    browser,
  };
});

// Mock Playwright using the hoisted variables
vi.mock("playwright", () => {
  return {
    chromium: {
      launch: vi.fn().mockResolvedValue(mocks.browser),
    },
  };
});

describe("crawlPage (Vitest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";

    // Setup default mock behaviors
    mocks.newPage.mockResolvedValue(mocks.page);

    // Mock evaluate to run the function in the JSDOM environment
    mocks.evaluate.mockImplementation(async (fn: any, args: any) => {
      return fn(args);
    });
  });

  test("should capture Last-Modified header", async () => {
    const mockUrl = "http://example.com/page";
    const mockDate = "Wed, 21 Oct 2015 07:28:00 GMT";

    // Setup the mock response
    mocks.goto.mockResolvedValue({
      ok: () => true,
      status: () => 200,
      url: () => mockUrl,
      headers: () => ({
        "last-modified": mockDate,
      }),
    });
    mocks.url.mockReturnValue(mockUrl); // just for completeness

    // Call the function with our mock browser
    const result = await crawlPage(mocks.browser as any, mockUrl);

    // Verify
    expect(result).not.toBeNull();
    expect(result?.lastModified).toBe(mockDate);
    expect(result?.url).toBe(mockUrl);
  });

  test("should return null if redirected to a different origin", async () => {
    const startUrl = "http://example.com/start";
    const startOrigin = "http://example.com";
    const redirectUrl = "http://other-domain.com/page";

    // Setup the mock response to simulate a redirect
    mocks.goto.mockResolvedValue({
      ok: () => true,
      status: () => 200,
      url: () => redirectUrl, // This represents the final URL after redirect
      headers: () => ({}),
    });

    // Call crawlPage with startOrigin
    const result = await crawlPage(mocks.browser as any, startUrl, startOrigin);

    // Verify
    expect(result).toBeNull();
    // Also verify evaluate was NOT called (proving we skipped scraping)
    expect(mocks.evaluate).not.toHaveBeenCalled();
  });

  test("should return null if redirected to an already visited URL", async () => {
    const startUrl = "http://example.com/about";
    const redirectUrl = "http://example.com/about/";
    const visited = new Set(["http://example.com/about/"]);

    // Setup the mock response to simulate a redirect
    mocks.goto.mockResolvedValue({
      ok: () => true,
      status: () => 200,
      url: () => redirectUrl,
      headers: () => ({}),
    });

    // Call crawlPage with visited set
    const result = await crawlPage(
      mocks.browser as any,
      startUrl,
      undefined,
      visited,
    );

    // Verify
    expect(result).toBeNull();
    // Also verify evaluate was NOT called
    expect(mocks.evaluate).not.toHaveBeenCalled();
  });

  test("should NOT return null if NOT redirected, even if URL is in visited set", async () => {
    const mockUrl = "http://example.com/page";
    const visited = new Set([mockUrl]);

    // Setup the mock response
    mocks.goto.mockResolvedValue({
      ok: () => true,
      status: () => 200,
      url: () => mockUrl, // Same as input URL (no redirect)
      headers: () => ({}),
    });

    // Call crawlPage with visited set
    const result = await crawlPage(
      mocks.browser as any,
      mockUrl,
      undefined,
      visited,
    );

    // Verify
    expect(result).not.toBeNull();
    expect(result?.url).toBe(mockUrl);
    // Verify evaluate WAS called (meaning we DID scrape the content)
    expect(mocks.evaluate).toHaveBeenCalled();
  });

  describe("targetSubdirectory restriction", () => {
    const targetSubdirectory = "http://example.com/articles/";

    test("should skip scraping content if URL is outside targetSubdirectory", async () => {
      const mockUrl = "http://example.com/courses/page";

      mocks.goto.mockResolvedValue({
        ok: () => true,
        status: () => 200,
        url: () => mockUrl,
        headers: () => ({}),
      });
      mocks.title.mockResolvedValue("Page Title");

      const result = await crawlPage(
        mocks.browser as any,
        mockUrl,
        undefined,
        undefined,
        targetSubdirectory,
      );

      expect(result).not.toBeNull();
      expect(result?.url).toBe(mockUrl);
      expect(result?.content).toBeNull();
      expect(mocks.evaluate).not.toHaveBeenCalled();
    });

    test("should scrape content if URL is inside targetSubdirectory", async () => {
      const mockUrl = "http://example.com/articles/how-to-scrape";

      mocks.goto.mockResolvedValue({
        ok: () => true,
        status: () => 200,
        url: () => mockUrl,
        headers: () => ({}),
      });

      const result = await crawlPage(
        mocks.browser as any,
        mockUrl,
        undefined,
        undefined,
        targetSubdirectory,
      );

      expect(result).not.toBeNull();
      expect(result?.url).toBe(mockUrl);
      expect(result?.content).not.toBeNull();
      expect(mocks.evaluate).toHaveBeenCalled();
    });

    test("should scrape content if targetSubdirectory is NOT provided", async () => {
      const mockUrl = "http://example.com/anywhere";

      mocks.goto.mockResolvedValue({
        ok: () => true,
        status: () => 200,
        url: () => mockUrl,
        headers: () => ({}),
      });

      const result = await crawlPage(mocks.browser as any, mockUrl);

      expect(result).not.toBeNull();
      expect(result?.content).not.toBeNull();
      expect(mocks.evaluate).toHaveBeenCalled();
    });

    test("should handle redirects: outside to inside -> should scrape", async () => {
      const startUrl = "http://example.com/redirect-me";
      const finalUrl = "http://example.com/articles/welcome";

      mocks.goto.mockResolvedValue({
        ok: () => true,
        status: () => 200,
        url: () => finalUrl,
        headers: () => ({}),
      });

      const result = await crawlPage(
        mocks.browser as any,
        startUrl,
        undefined,
        undefined,
        targetSubdirectory,
      );

      expect(result?.url).toBe(finalUrl);
      expect(result?.content).not.toBeNull();
      expect(mocks.evaluate).toHaveBeenCalled();
    });

    test("should handle redirects: inside to outside -> should skip scrape", async () => {
      const startUrl = "http://example.com/articles/redirect-out";
      const finalUrl = "http://example.com/other-place";

      mocks.goto.mockResolvedValue({
        ok: () => true,
        status: () => 200,
        url: () => finalUrl,
        headers: () => ({}),
      });
      mocks.title.mockResolvedValue("Page Title");

      const result = await crawlPage(
        mocks.browser as any,
        startUrl,
        undefined,
        undefined,
        targetSubdirectory,
      );

      expect(result?.url).toBe(finalUrl);
      expect(result?.content).toBeNull();
      expect(mocks.evaluate).not.toHaveBeenCalled();
    });
  });

  describe("extractLinks (Vitest)", () => {
    const mockUrl = "http://example.com/page";

    beforeEach(() => {
      mocks.goto.mockResolvedValue({
        ok: () => true,
        status: () => 200,
        url: () => mockUrl,
      });

      // Mock JSDOM baseURI
      Object.defineProperty(document, "baseURI", {
        value: "http://example.com/",
        configurable: true,
      });
    });

    test("should remove query params when removeQueryParams is true", async () => {
      const linksWithQueries = [
        "http://example.com/a?foo=bar",
        "http://example.com/b/?baz=qux",
      ];

      // Mock the browser evaluate function to simulate finding these links
      mocks.evaluate.mockImplementation(
        async (fn: any, { pageOrigin, removeQueryParams }: any) => {
          // Inside the evaluate function, we simulate what the browser does
          // Note: we're using a simplified version for testing the logic
          const results = linksWithQueries.map((link) => {
            const urlObj = new URL(link, "http://example.com/");
            if (removeQueryParams) {
              urlObj.search = "";
            }
            return urlObj.href;
          });
          return results;
        },
      );

      const links = await extractLinks(mocks.browser as any, mockUrl, true);

      expect(links).toContain("http://example.com/a");
      expect(links).toContain("http://example.com/b/");
      expect(links).not.toContain("http://example.com/a?foo=bar");
      expect(links).not.toContain("http://example.com/b/?baz=qux");
    });

    test("should NOT remove query params when removeQueryParams is false", async () => {
      const linksWithQueries = ["http://example.com/a?foo=bar"];

      mocks.evaluate.mockImplementation(
        async (fn: any, { pageOrigin, removeQueryParams }: any) => {
          const results = linksWithQueries.map((link) => {
            const urlObj = new URL(link, "http://example.com/");
            if (removeQueryParams) {
              urlObj.search = "";
            }
            return urlObj.href;
          });
          return results;
        },
      );

      const links = await extractLinks(mocks.browser as any, mockUrl, false);

      expect(links).toContain("http://example.com/a?foo=bar");
    });
  });
});
