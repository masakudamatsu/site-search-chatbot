# Tech Context

## Frameworks & Libraries
- **Application Framework:** Next.js (for both frontend and backend)
- **Styling:** Tailwind CSS
- **Web Scraping:** `playwright-core` and `@sparticuz/chromium-min` (serverless Chromium with remote binary loading) for production, `playwright` for local development
- **AI/LLM Orchestration:** LangChain.js (for text splitting)
- **Frontend AI Integration:** Vercel AI SDK
- **Markdown Rendering:** `react-markdown` with `remark-gfm`
- **Typography Styling:** `@tailwindcss/typography`

## Services & Platforms
- **LLM Hosting:** Together.ai (for `gpt-oss-20b`)
- **Embedding Generation:** Together.ai (`Alibaba-NLP/gte-modernbert-base`, which is defined in `.env.local`)
- **Vector Database:** Supabase pgvector
- **Deployment:** Vercel
- **Scheduled Jobs:** Vercel Cron Jobs

## Database Schema
- **SQL Scripts:** Custom SQL, such as function definitions, is stored in the `supabase/` directory. These scripts should be applied manually via the Supabase SQL Editor to keep the live database schema in sync with the repository.
- **Table Structure:** The `documents` table uses a flat schema where metadata fields (url, title, description, etc.) are stored as individual columns, rather than in a single JSONB column.

## Development & Testing
- **E2E & Visual Regression Testing:** Playwright
- **Test Execution:** The project has two primary test scripts:
  - `npm test`: Runs the Playwright suite on Chromium only. This is the recommended command for quick, iterative development.
  - `npm run test:all`: Runs the Playwright suite on all configured browsers (Chromium, Firefox, WebKit), which is suitable for CI or pre-commit checks.
- **Configuration:** Environment variables will be used to manage settings like the target website URL, LLM model, and cron job frequency.
- **Testing Streaming Responses:** Attempts to mock streaming API responses with Playwright's `route.fulfill()` have failed, as its `body` property does not accept a `ReadableStream`. The established pattern for this project is to test features that rely on streaming against the real API, using carefully timed assertions to validate UI states during the stream.
 

## Development Methodology
- **Test-Driven Development (TDD):** The project strictly follows a TDD approach as defined in `.clinerules/06-tdd-workflow.md`. For each new feature, a failing test must be written first (Red), followed by the minimal implementation to pass the test (Green), and finally code cleanup (Refactor).

## Web Crawler Implementation
- **Core Logic (`src/lib/crawler.ts`):**
  - `crawlPage(url, startOrigin?)`: Fetches a single page, verifies the origin after redirection, and extracts its primary text content.
  - `extractLinks(url)`: Parses a page to find all unique, internal, absolute URLs, excluding fragments.
  - `crawlWebsite(startUrl, limit)`: Orchestrates the entire crawl, managing a queue of URLs to visit and aggregating content.
- **Testing (`tests/integration/crawler.spec.ts`):** An integration test suite verifies the functionality of the crawler functions against live websites.

## Coding Standards & References
The following standards files act as strict reference documentation. **Before writing code for any of these technologies, you MUST read the corresponding standard file in `docs/standards/`.**

- **LangChain:** `docs/standards/langchain.md`
- **Next.js:** `docs/standards/nextjs.md`
- **Playwright:** `docs/standards/playwright.md`
- **React Markdown:** `docs/standards/react-markdown.md`
- **Supabase:** `docs/standards/supabase.md`
- **Tailwind CSS:** `docs/standards/tailwindcss.md`
- **Together AI:** `docs/standards/together-ai.md`
- **Vercel AI SDK:** `docs/standards/vercel-ai-sdk.md`
- **Vercel Cron Jobs:** `docs/standards/vercel-cron-jobs.md`
