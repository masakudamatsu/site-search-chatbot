export default function BlinkingCursor() {
  return (
    <div aria-live="polite" aria-atomic="true" className="inline-block">
      <span className="animate-blink ml-1 inline-block h-5 w-1 bg-white"></span>
      <span className="sr-only">More to come. Please wait.</span>
    </div>
  );
}
