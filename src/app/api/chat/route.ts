import { convertToModelMessages, streamText } from "ai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { getRelevantContext } from "@/lib/ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Create a Together.ai AI provider instance
// Explicitly pass the API key from environment variables
const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the most recent user message
  const lastMessage = messages[messages.length - 1];

  let queryText = "";
  if (Array.isArray(lastMessage.parts)) {
    queryText = lastMessage.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");
  }

  let context = "";
  if (queryText) {
    // Get relevant context from the database
    context = await getRelevantContext(queryText);
  }

  // Create a system message with the context
  const systemMessage = {
    role: "system" as const,
    content: `You are a professional communicator who is good at summarizing a large amount of information into sentences accessible to those who are not familiar with it. You also have the habit of citing the sources of information accurately to each piece of text in a similar way to academic writing. Your task is to check the following context to answer the user's question:
${context}

Instructions:
- Answer the question based ONLY on the provided context.
- Provide a comprehensive and detailed answer, including as much relevant information from the context as possible.
- If the answer is not in the context, say you don't know.
- Cite the source page title and URL for the information you use.
    - IMPORTANT: When using information from a specific excerpt, check the "URL:" field provided at the top of that excerpt. Cite THAT URL exactly. Do not mix up sources.
    - IMPORTANT: Format the source page title and URL strictly as Markdown links using standard square brackets [] and parentheses ().
- Cite multiple source pages if the information comes from different sources.
- IMPORTANT: Place the source page title as a link *immediately* before the period of the sentence where the information is used. Do not wait until the end of the paragraph.
    - CORRECT: The first website was created at CERN in November 1990 [WWW Project History](http://info.cern.ch/hypertext/WWW/History.html). Tim Berners-Lee created it on a NeXT workstation [People involved in the WorldWideWeb project](http://info.cern.ch/hypertext/WWW/People.html).
    - INCORRECT: The first website was created at CERN in November 1990. [WWW Project History](http://info.cern.ch/hypertext/WWW/History.html) Tim Berners-Lee created it on a NeXT workstation. [People involved in the WorldWideWeb project](http://info.cern.ch/hypertext/WWW/People.html)
    - INCORRECT: The first website was created at CERN in November 1990. Tim Berners-Lee created it on a NeXT workstation [WWW Project History](http://info.cern.ch/hypertext/WWW/History.html), [People involved in the WorldWideWeb project](http://info.cern.ch/hypertext/WWW/People.html).
- STRICTLY FORBIDDEN: Do not wrap the source page title as a link in extra brackets like 【】.
    - CORRECT: The first website was created at CERN in November 1990 [WWW Project History](http://info.cern.ch/hypertext/WWW/History.html).
    - INCORRECT: The first website was created at CERN in November 1990 【WWW Project History】(http://info.cern.ch/hypertext/WWW/History.html).
    - INCORRECT: The first website was created at CERN in November 1990 【WWW Project History](http://info.cern.ch/hypertext/WWW/History.html).`,
  };

  // Convert the UIMessage[] to ModelMessage[]
  // The messages that are sent from the frontend by the useChat hook are in the UIMessage format, which is designed for rendering in the UI. The backend streamText function, however, needs the messages in a different format, ModelMessage, which is designed to be sent to the LLM API.
  const modelMessages = convertToModelMessages(messages);

  const modelName = process.env.NEXT_PUBLIC_CHAT_MODEL || "openai/gpt-oss-20b";

  const result = await streamText({
    model: togetherai(modelName), // see https://docs.together.ai/docs/serverless-models#chat-models for the list of chat model names used by Togther AI
    messages: [systemMessage, ...modelMessages],

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
