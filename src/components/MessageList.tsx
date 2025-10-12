"use client";

import React from "react";
import ChatMessage from "./ChatMessage";

interface MessageListProps {
  messages: string[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <ul role="list" className="flex flex-col gap-4">
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}
    </ul>
  );
}
