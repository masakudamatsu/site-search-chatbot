import { describe, test, expect, vi, beforeEach } from "vitest";
import { streamText } from "ai";

// Use vi.hoisted to ensure the mock is available before the module is imported
const { mockCreateOpenAI } = vi.hoisted(() => ({
  mockCreateOpenAI: vi.fn().mockReturnValue(vi.fn()),
}));

// Mock dependencies
vi.mock("ai", async (importOriginal) => {
  const original = await importOriginal<typeof import("ai")>();
  return {
    ...original,
    streamText: vi.fn().mockReturnValue({
      toUIMessageStreamResponse: vi.fn().mockReturnValue(new Response()),
    }),
    convertToModelMessages: vi.fn().mockReturnValue([]),
  };
});

vi.mock("@/lib/ai", () => ({
  getRelevantContext: vi.fn().mockResolvedValue("Mocked context"),
}));

// Mock the providers
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: mockCreateOpenAI,
}));

describe("Chat API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use dummy keys for testing
    process.env.HF_TOKEN = "hf-test-token";
  });

  test("should use the Hugging Face (OpenAI-compatible) provider", async () => {
    // Import the handler INSIDE the test to ensure mocks are active
    const { POST } = await import("@/app/api/chat/route");

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    await POST(req);

    // After migration, we expect createOpenAI to have been called for Hugging Face
    expect(mockCreateOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://router.huggingface.co/v1/",
        apiKey: "hf-test-token",
      }),
    );

    // Verify streamText was called
    expect(streamText).toHaveBeenCalled();
  });
});
