export default function TypingIndicator() {
  return (
    <li
      className="flex items-center justify-start"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center space-x-1 rounded-full bg-gray-700 p-3">
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
      </div>
      <span className="sr-only">Preparing an answer...</span>
    </li>
  );
}
