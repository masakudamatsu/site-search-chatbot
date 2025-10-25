"use client";

import { memo } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { type UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
  isTyping: boolean;
}

const MessageList = memo(function MessageList({
  messages,
  isTyping,
}: MessageListProps) {
  return (
    <ul role="list" className="flex flex-col gap-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
    </ul>
  );
});

export default MessageList;
