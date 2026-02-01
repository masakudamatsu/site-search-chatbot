import React from "react";
import { type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BlinkingCursor from "@/components/BlinkingCursor";

interface ChatMessageProps {
  message: UIMessage;
  isLastMessage: boolean;
  isStreaming: boolean;
}

export default function ChatMessage({
  message,
  isLastMessage,
  isStreaming,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const showCursor = isLastMessage && isStreaming && !isUser;

  return (
    <li
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      role="listitem"
    >
      <div
        className={`prose prose-invert rounded-2xl p-4 max-w-xl ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-700"
        }`}
      >
        {/* Let TypeScript infer the type of 'part' here */}
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            // Try accessing 'part.text' instead of 'part.value'
            return (
              <ReactMarkdown
                key={index}
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {part.text}
              </ReactMarkdown>
            );
          }
          // Return null for other part types we don't handle yet
          return null;
        })}
        {showCursor && <BlinkingCursor />}
      </div>
    </li>
  );
}
