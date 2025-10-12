# Active Context

## Current Focus
Core Feature Development: Backend API and LLM Integration.

## Next Steps
1.  **Create API Route:** Set up a new Next.js API route handler at `/api/chat` that will receive the user's message and chat history.
2.  **Integrate Vercel AI SDK:** Use the `streamText` function from the Vercel AI SDK to send the prompt to the language model and stream the response back to the client.
3.  **Update Frontend:** Modify the `ChatInput` component to send a `POST` request to the new `/api/chat` endpoint instead of only updating local state.
4.  **Handle Streaming Response:** Update the `Home` component (`page.tsx`) to handle the streaming response from the API and display the AI's message in the `MessageList`.
