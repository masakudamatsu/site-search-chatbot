import React from "react";

interface ChatMessageProps {
  message: string;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // For now, all messages will have the same style.
  // We can later differentiate between user and AI messages.
  return (
    <li className="rounded-2xl bg-gray-700 p-4">
      <p>{message}</p>
    </li>
  );
}
