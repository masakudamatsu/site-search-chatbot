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
    - Extract page metadata (title, description).
    - Correctly handle HTTP redirects to avoid duplicate processing.
- A complete, TDD-built data ingestion pipeline (`src/lib/ingestion.ts`) that can:
    - Split page content into chunks (`processPage`).
    - Generate embeddings for each chunk (`generateEmbeddings`).
    - Store the data in the database (`storeEmbeddings`).
    - Orchestrate the full process (`ingestData`).

## What's Left to Build
- **Crawler/Ingestion Integration:** Connect the crawler to the ingestion pipeline and implement real clients for Supabase and Together.ai.
- **Cron Job**: Set up the Vercel cron job to trigger the process.

## Deferred Tasks
### Web crawler
- **URL Normalization:** Stripping tracking parameters.
- **`robots.txt` Compliance:** Respecting crawler exclusion rules.
- **Polite Rate-Limiting:** Adding delays between requests.
- **Header-based Content-Type Verification:** A safety net for non-HTML dynamic URLs.

## Known Issues
- For Safari, the UI gets frozen in the middle of streaming an answer, which causes the blinking cursor to be not blinking and the stop button to be not functioning. This is because the React Markdown occupies the main thread for up to 15 seconds. (No such problem is found for Chrome and Firefox.) The issue is postponed for now.
