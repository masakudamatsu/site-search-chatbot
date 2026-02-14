"use client";

import { FC } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import TypingIndicator from "@/components/TypingIndicator";
import MetadataDisplay from "@/components/MetadataDisplay";

interface ChatInterfaceProps {
  lastCrawledAt: string | null;
}

const ChatInterface: FC<ChatInterfaceProps> = ({ lastCrawledAt }) => {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleSendMessage = (message: { text: string }) => {
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: message.text }],
    });
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
              Ask questions about the site content.
            </p>
            <MetadataDisplay variant="welcome" lastCrawledAt={lastCrawledAt} />
          </div>

          <div className="w-full max-w-2xl p-4">
            <ChatInput
              onSendMessage={handleSendMessage}
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

              {error && (
                <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center">
                  <p className="text-gray-700">
                    Our servers are at capacity right now. Please hold
                    tight—I’ll be ready to chat again very soon.
                  </p>
                  <button
                    onClick={() => regenerate()}
                    className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  >
                    Ask Again
                  </button>
                </div>
              )}

              <div className="flex justify-start">
                {status === "submitted" && !error && <TypingIndicator />}
              </div>
            </div>
          </div>
          <div className="w-full max-w-2xl self-center p-4">
            <MetadataDisplay variant="chat" lastCrawledAt={lastCrawledAt} />
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              stop={stop}
            />
          </div>
        </>
      )}
    </main>
  );
};

export default ChatInterface;
