"use client";

import ChatMessage from "./ChatMessage";
import { type UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

export default function MessageList({
  messages,
  isStreaming,
}: MessageListProps) {
  return (
    <ul role="list" className="flex flex-col gap-4">
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          isLastMessage={index === messages.length - 1}
          isStreaming={isStreaming}
        />
      ))}
    </ul>
  );
}
