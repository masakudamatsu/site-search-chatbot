import { convertToModelMessages, streamText } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Create a Together.ai AI provider instance
// Explicitly pass the API key from environment variables
const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert the UIMessage[] to ModelMessage[]
  // The messages that are sent from the frontend by the useChat hook are in the UIMessage format, which is designed for rendering in the UI. The backend streamText function, however, needs the messages in a different format, ModelMessage, which is designed to be sent to the LLM API.
  const modelMessages = convertToModelMessages(messages);

  const result = await streamText({
    model: togetherai("openai/gpt-oss-20b"), // see https://docs.together.ai/docs/serverless-models#chat-models for the list of chat model names used by Togther AI
    messages: modelMessages,

    // // debugging callbacks
    // onFinish: async (result) => {
    //   console.log("Stream finished. Result:", result);
    // },
    // onError: async (error) => {
    //   console.error("Stream error:", error);
    // },
  });

  return result.toUIMessageStreamResponse(); // `toUIMessageStreamResponse()` sends the full, structured `UIMessage` stream protocol that the `useChat` hook is designed to consume.
}
