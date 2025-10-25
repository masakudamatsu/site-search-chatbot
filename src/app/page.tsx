"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";

export default function Home() {
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  return (
    <main className="flex h-screen flex-col">
      {messages.length === 0 ? (
        // Welcome Screen
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-bold">Site Search Chatbot</h1>
          </div>
          <div className="w-full max-w-2xl p-4">
            <ChatInput onSendMessage={sendMessage} />
          </div>
        </div>
      ) : (
        // Active Chat
        <>
          <div className="flex-grow overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl p-4">
              <MessageList messages={messages} />
            </div>
          </div>
          <div className="w-full max-w-2xl self-center p-4">
            <ChatInput onSendMessage={sendMessage} />
          </div>
        </>
      )}
    </main>
  );
}
