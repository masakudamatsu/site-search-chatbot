# Tech Context

## Frameworks & Libraries
- **Application Framework:** Next.js (for both frontend and backend)
- **Styling:** Tailwind CSS
- **Web Scraping:** Playwright
- **AI/LLM Orchestration:** LangChain.js (for text splitting)
- **Frontend AI Integration:** Vercel AI SDK
- **Markdown Rendering:** `react-markdown` with `remark-gfm`
- **Typography Styling:** `@tailwindcss/typography`

## Services & Platforms
- **LLM Hosting:** Together.ai (for `gpt-oss-20b`)
- **Embedding Generation:** Together.ai
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
- **Test-Driven Development (TDD):** The project will follow a TDD approach. For each new feature, a failing test (primarily using Playwright for end-to-end testing) will be written first. The implementation code will then be developed to make the test pass, followed by an optional refactoring step.

## Web Crawler Implementation
- **Core Logic (`src/lib/crawler.ts`):**
  - `crawlPage(url)`: Fetches a single page and extracts its primary text content.
  - `extractLinks(url)`: Parses a page to find all unique, internal, absolute URLs, excluding fragments.
  - `crawlWebsite(startUrl, limit)`: Orchestrates the entire crawl, managing a queue of URLs to visit and aggregating content.
- **Testing (`tests/integration/crawler.spec.ts`):** An integration test suite verifies the functionality of the crawler functions against live websites.
