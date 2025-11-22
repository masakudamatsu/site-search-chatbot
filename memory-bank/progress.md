# Progress

## What Works
- The project's memory bank is fully initialized with a detailed brief, context, and technical patterns.
- A comprehensive set of `.clinerules` has been established to guide development, including specific rules for planning, in-task workflows, and technology usage.
- A fully initialized Next.js application using the `src` directory structure and TypeScript path aliases.
- A complete Playwright configuration for end-to-end testing, integrated with the Next.js development server.
- A successful TDD cycle verifying the homepage title and a fully configured Tailwind CSS setup.
- A complete, client-side chat interface that matches the Claude AI aesthetic.
- A fully functional, end-to-end streaming chat feature:
    - A backend API route at `/api/chat` that handles requests.
    - Integration with the Vercel AI SDK (`useChat`, `streamText`) for state management and streaming.
    - Connection to an open-source LLM (`gpt-oss-20b`) hosted on Together.ai.
    - Frontend components capable of rendering streamed Markdown responses, including tables, thanks to `react-markdown` and `@tailwindcss/typography`.
    - A passing E2E test (`e2e/chat.spec.ts`) that verifies the entire flow.
- A complete, multi-stage loading indicator (`Stop Generating` button, typing indicator, and blinking cursor) to provide user feedback during response generation.
- An initial web crawler implementation (`src/lib/crawler.ts`) that can:
    - Recursively crawl a website starting from a given URL.
    - Extract text content, prioritizing the `<main>` element.
    - Discover and follow internal links while ignoring external ones and URL fragments.
    - Filter out links with non-HTML extensions (PDFs, images, etc.).

## What's Left to Build
- Productionize the web crawler by implementing:
    - URL normalization (e.g., stripping tracking parameters).
    - `robots.txt` compliance.
    - Polite rate-limiting.
    - Metadata extraction (titles, descriptions).
    - Header-based Content-Type verification (deferred).
- The data ingestion pipeline to process and store crawled content.

## Known Issues
- For Safari, the UI gets frozen in the middle of streaming an answer, which causes the blinking cursor to be not blinking and the stop button to be not functioning. This is because the React Markdown occupies the main thread for up to 15 seconds. (No such problem is found for Chrome and Firefox.) The issue is postponed for now.
