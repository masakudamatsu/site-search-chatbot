"use client";

import React from "react";
import ChatMessage from "./ChatMessage";
import { type UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ul role="list" className="flex flex-col gap-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </ul>
  );
}
