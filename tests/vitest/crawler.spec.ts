import { describe, test, expect, vi, beforeEach } from "vitest";
import { crawlPage } from "@/lib/crawler";

// Define mocks that are hoisted to the top of the file
const mocks = vi.hoisted(() => {
  const goto = vi.fn();
  const evaluate = vi.fn();
  const close = vi.fn();
  const url = vi.fn(); // just for completeness
  const newPage = vi.fn();

  const page = {
    goto,
    evaluate,
    close,
    url, // just for completeness
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
});
