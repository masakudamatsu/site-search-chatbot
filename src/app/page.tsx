"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import TypingIndicator from "@/components/TypingIndicator";

export default function Home() {
  const [ingestionUrl, setIngestionUrl] = useState("");
  const [ingestionStatus, setIngestionStatus] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleIngest = async () => {
    if (!ingestionUrl) {
      setIngestionStatus("Please enter a URL.");
      return;
    }
    setIsIngesting(true);
    setIngestionStatus(
      "Crawling and ingesting website... this may take a moment."
    );

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseUrl: ingestionUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong.");
      }

      const data = await response.json();
      setIngestionStatus(
        `Ingestion complete! ${data.count} pages indexed. You can now ask questions.`
      );
    } catch (error) {
      if (error instanceof Error) {
        setIngestionStatus(`Error: ${error.message}`);
      } else {
        setIngestionStatus("An unknown error occurred.");
      }
    } finally {
      setIsIngesting(false);
      setIngestionUrl("");
    }
  };

  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  return (
    <main className="flex h-screen flex-col">
      {messages.length === 0 ? (
        // Welcome Screen
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-bold">Site Search Chatbot</h1>
            <p className="text-gray-500">
              Enter a website URL to load its content, then ask questions.
            </p>
          </div>

          <div className="w-full max-w-md p-4">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com"
                value={ingestionUrl}
                onChange={(e) => setIngestionUrl(e.target.value)}
                disabled={isIngesting}
                className="w-full rounded-md border border-gray-300 p-2 text-white placeholder-gray-500"
              />
              <button
                onClick={handleIngest}
                disabled={isIngesting}
                className="rounded-md bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
              >
                {isIngesting ? "Loading..." : "Load"}
              </button>
            </div>
            {ingestionStatus && (
              <p className="mt-2 text-center text-sm text-gray-500">
                {ingestionStatus}
              </p>
            )}
          </div>

          <div className="w-full max-w-2xl p-4">
            <ChatInput
              onSendMessage={sendMessage}
              isLoading={isLoading}
              stop={stop}
            />
          </div>
        </div>
      ) : (
        // Active Chat
        <>
          <div className="flex-grow overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl p-4">
              <MessageList messages={messages} isStreaming={isStreaming} />
              <div className="flex justify-start">
                {status === "submitted" && <TypingIndicator />}
              </div>
            </div>
          </div>
          <div className="w-full max-w-2xl self-center p-4">
            <ChatInput
              onSendMessage={sendMessage}
              isLoading={isLoading}
              stop={stop}
            />
          </div>
        </>
      )}
    </main>
  );
}
