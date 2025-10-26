"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import TypingIndicator from "@/components/TypingIndicator";

export default function Home() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isStreaming = status === "streaming";

  return (
    <main className="flex h-screen flex-col">
      {messages.length === 0 ? (
        // Welcome Screen
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-bold">Site Search Chatbot</h1>
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
