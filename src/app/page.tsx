"use client";

import { useState } from "react";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = (message: string) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };
  return (
    <main className="flex h-screen flex-col">
      {messages.length === 0 ? (
        // Welcome Screen Layout (when no messages)
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <h1 className="text-4xl font-bold">Site Search Chatbot</h1>
          </div>
          <div className="w-full max-w-2xl p-4">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      ) : (
        // Active Chat Layout (when messages exist)
        <>
          <div className="flex-grow overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl p-4">
              <MessageList messages={messages} />
            </div>
          </div>
          <div className="w-full max-w-2xl self-center p-4">
            <ChatInput onSendMessage={handleSendMessage} />
          </div>
        </>
      )}
    </main>
  );
}
