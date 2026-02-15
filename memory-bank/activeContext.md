# Active Context

## Primary Goal
Our top priority is to finish building a usable, self-contained prototype of the application as quickly as possible. The core workflow will be for a user to provide a website URL, trigger a one-time ingestion, and then immediately begin asking questions of the chatbot.

## Current Focus Chain
We are transitioning from the prototype phase to a more robust, production-ready system.

## Recently Completed
- **Ingestion Performance and Stability:**
    *   **Crawler Performance Optimization**:
        - Moved same-origin check for redirects inside `crawlPage` to skip scraping off-origin pages.
        - Implemented early exit in `crawlPage` to skip scraping if a redirect lands on an already visited URL.
        - Optimized execution order to perform these checks immediately after navigation, before header extraction or content scraping.
        - Refactored the URL queue from an array to a `Set` to automatically prevent duplicate queuing and improve the accuracy of real-time progress logging.
    *   **Embedding Model Upgrade**: Switched to `intfloat/multilingual-e5-large-instruct` (1024 dimensions) as Together AI deprecated the previous model. This model has a 512-token context window.
    *   **Optimized Chunking**: Reduced `chunkSize` to 300 and `chunkOverlap` to 50 in `src/lib/ingestion.ts` to stay within the new model's 512-token limit, accounting for metadata enrichment and multilingual (Japanese) token density.
    *   **Crawler Redirect Strictness**: Implemented an origin check in `src/lib/crawler.ts` to ensure the crawler doesn't follow redirects to external domains, preventing crawler leakage.
    *   **Supabase Security Hardening**: Enabled Row Level Security (RLS) on `documents` and `crawled_pages` tables. Moved the `vector` extension to a dedicated `extensions` schema and updated the `match_documents` function with a strict `search_path = public, extensions` for enhanced security.

- **Prepare for Production Deployment:**
    *   **Environment Refactor**: Renamed `TARGET_URL` to `NEXT_PUBLIC_TARGET_URL` and introduced `NEXT_PUBLIC_CHAT_MODEL` to make configuration accessible to both frontend and backend.
    *   **Metadata Display**: Created a reusable `MetadataDisplay` component to show the active website and LLM model on the UI, improving transparency and reusability.
    *   **Search Engine Privacy**: Added `noindex, nofollow` metadata to the root layout to prevent search engines from indexing the test site.
    *   **TDD Verification**: Updated backend tests and added new E2E tests to verify that metadata is correctly displayed, that privacy settings are in place, and that environment variables are properly utilized.
    *   **Documentation**: Updated `README.md` with production setup instructions and new environment variable requirements.
    *   **Chromium Fix for Vercel**: Refactored the crawler to use `@sparticuz/chromium-min` and `playwright-core` in production. Implemented dynamic architecture detection (`process.arch`) to select the correct binary pack (x64/arm64) and increased function timeout to 60s.
    *   **Embedding Model Migration**: Switched to `intfloat/multilingual-e5-large-instruct` (1024 dimensions) after the previous model was deprecated by Together AI. Refactored the code to use the `EMBEDDING_MODEL` environment variable for better resilience.
    *   **SQL Refactor**: Restructured the `supabase/` folder into task-oriented scripts (`documents.sql`, `crawled_pages.sql`, `match_documents.sql`) and updated all schema definitions to the new 1024-dimension requirement.
    *   **Crawler Improvements**: Added real-time progress logging to the crawler, displaying the count of processed pages against total discovered URLs.
    *   **Vercel Ingestion Status**: Deployment is successful, but the crawler currently crashes on Vercel after the first page ("Target page, context or browser has been closed"). This remains an open issue, likely related to memory limits or environment stability.

- **Enhance Answer Quality (Context Enrichment):**
    *   Implemented **Context Enrichment** by prepending Page Title and URL to every text chunk in `src/lib/ingestion.ts`. This resolves the context fragmentation caused by small chunk sizes.
    *   Refactored the RAG prompt in `src/app/api/chat/route.ts` and the retrieval logic in `src/lib/ai.ts` to remove redundant headers. This resolved the LLM hallucination issue where trailing `】` characters were added to URLs.
    *   Updated E2E and unit tests to verify the enrichment logic and ensure retrieval stability.
    *   Updated `README.md` with detailed Supabase initialization and re-ingestion instructions.
    *   Added `supabase/clear-crawl-history.sql` helper script.

- **Show Last Crawled Date:**
    *   **New Database Table**: Created `crawl_status` to record successful crawl completions.
    - **Backend Integration**: Updated `/api/ingest` to record a completion timestamp in `crawl_status` upon successful completion.
    - **Frontend Refactor**: Converted `src/app/page.tsx` to a Server Component for secure data fetching and created `src/components/ChatInterface.tsx` for client-side chat logic.
    - **UI Enhancement**: Updated `MetadataDisplay.tsx` to show the "Last crawled" date with hours and minutes. Implemented client-side rendering via `useEffect` to ensure correct localization to the user's timezone and resolve hydration mismatches.
    - **Quality Assurance**: Added an E2E test `tests/e2e/metadata.spec.ts` that verifies the timezone-aware date display by injecting test records and forcing browser timezones.
    - **Test Integrity**: Refactored `afterAll` hooks in all integration and E2E tests to ensure they correctly clean up metadata tables (`crawled_pages`, `crawl_status`) using targeted, safe deletion logic to protect development data.
    - **Error Handling**: Implemented a user-friendly error message ("Our servers are at capacity...") and an "Ask Again" retry button in `ChatInterface.tsx` to handle LLM API failures (e.g., 503 errors).
    - **E2E Validation**: Added `tests/e2e/error-handling.spec.ts` to verify the error UI and retry trigger, using Playwright request interception.

- **Implement Smart Ingestion & Automation:**
    *   Implemented "Smart Updates" using `Last-Modified` headers and SHA-256 content checksums stored in a new `crawled_pages` table.
    *   Optimized crawler with a 10s timeout and strict origin-matching to handle obsolete/slow links.
    *   Secured the `/api/ingest` endpoint with `CRON_SECRET` and automated it via Vercel Cron Jobs.
    *   Removed manual ingestion UI from the frontend.
    *   Standardized test scripts in `package.json` and documented everything in `README.md`.
- **Full E2E Testing:**
    *   Verified the entire UI-driven ingestion and Q&A flow with `tests/e2e/rag-chat.spec.ts`.
- **Integrate RAG into Chat API:**
    *   Implemented context retrieval in `src/app/api/chat/route.ts` using `getRelevantContext`.
    *   Updated the system prompt to enforce Markdown citations and strict source attribution.
    *   Handled message format differences (string vs parts) to ensure compatibility with Vercel AI SDK 5.0.
    *   Verified functionality with `tests/e2e/rag-chat.spec.ts` using a **Unique Content** strategy (injecting unique IDs into content and query) to isolate parallel test runs without serialization.
- **Ingestion Deduplication & Verification:**
    *   Updated `storeEmbeddings` in `src/lib/ingestion.ts` to delete existing embeddings for a URL before inserting new ones.
    *   Refactored integration tests to Vitest (`tests/vitest/ingestion.spec.ts`) and added a deduplication test case.
    *   Added `tests/vitest/retrieval.spec.ts` to verify end-to-end retrieval accuracy and deduplication against the real database.
- **RAG Tuning:**
    *   Optimized `match_threshold` (0.5) and `match_count` (10) in `src/lib/ai.ts` to ensure retrieval of relevant documents like `People.html`.
    *   Increased default ingestion limit to 45 pages in `src/app/api/ingest/route.ts`.
- **Database Schema Synchronization:**
    *   Confirmed the live Supabase database uses a flat schema for the `documents` table (columns: `url`, `title`, etc., instead of a `metadata` JSONB column).
    *   Updated `supabase/match_documents.sql` to reflect the correct function definition for this flat schema.
    *   Created `supabase/schema.sql` to document the table definition and extension setup.
    *   Updated `src/lib/ai.ts` and its tests to correctly handle the flat data structure returned by the database.
- **Implement Vector Search Logic:**
    *   Created the `match_documents` SQL function and stored it in the repository.
    *   Implemented the `getRelevantContext` function in `lib/ai.ts`.
    *   Set up Vitest for integration testing and wrote a comprehensive, mocked test suite for the AI library.
- **Write E2E Test for Ingestion UI:**
    *   Created a Playwright test to verify the new UI components.
    *   Mocked the `/api/ingest` endpoint to test the UI's response to different states (loading, success, error).
- **Add a "Load Website" UI to the Frontend:**
    *   Added an input field and "Load" button to the main page.
    *   Implemented client-side logic to call the `/api/ingest` endpoint.
    *   Added UI to display status feedback to the user during ingestion.
- **Crawler/Ingestion Integration**:
    - Created `src/lib/supabase.ts` and `src/lib/ai.ts` to provide real clients for the database and embedding generation.
    - Added integration tests for both clients.
    - Refactored `src/lib/crawler.ts` to improve performance and support a streaming callback.
    - Created an API endpoint at `src/app/api/ingest/route.ts` that ties the entire pipeline together.
    - Added an E2E test for the ingestion API (database assertions temporarily commented out).
- **Data Ingestion Pipeline**:
    - Implemented `processPage`, `generateEmbeddings`, `storeEmbeddings`, and the `ingestData` orchestrator.
    - Followed TDD with a comprehensive integration test suite.
- **Initial Crawler Implementation**:
    - Developed the core recursive crawling, content extraction, link discovery, and redirect handling logic.

## Post-Prototype Enhancements
- **Re-ranking**: For larger datasets, implement a re-ranking step (fetch 50, re-rank top 10) using a specialized model.
- **Automated Ingestion**: Set up a Vercel Cron Job to trigger the `/api/ingest` endpoint on a schedule.
- **Crawler Robustness**:
    - **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
    - **Rate Limiting**: Introduce a polite delay between requests.
    - **Query Parameter Normalization**: Strip common tracking parameters from URLs.
    - **Robust Content-Type Check**: Implement header-based filtering for dynamic URLs.
