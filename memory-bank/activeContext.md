# Active Context

## Primary Goal
Our top priority is to finish building a usable, self-contained prototype of the application as quickly as possible. The core workflow will be for a user to provide a website URL, trigger a one-time ingestion, and then immediately begin asking questions of the chatbot.

## Current Focus Chain
We are transitioning from the prototype phase to a more robust, production-ready system.

## Recently Completed
- **Prepare for Production Deployment:**
    *   **Environment Refactor**: Renamed `TARGET_URL` to `NEXT_PUBLIC_TARGET_URL` and introduced `NEXT_PUBLIC_CHAT_MODEL` to make configuration accessible to both frontend and backend.
    *   **Metadata Display**: Created a reusable `MetadataDisplay` component to show the active website and LLM model on the UI, improving transparency and reusability.
    *   **TDD Verification**: Updated backend tests and added new E2E tests to verify that metadata is correctly displayed and that environment variables are properly utilized.
    *   **Documentation**: Updated `README.md` with production setup instructions and new environment variable requirements.

- **Enhance Answer Quality (Context Enrichment):**
    *   Implemented **Context Enrichment** by prepending Page Title and URL to every text chunk in `src/lib/ingestion.ts`. This resolves the context fragmentation caused by small chunk sizes.
    *   Refactored the RAG prompt in `src/app/api/chat/route.ts` and the retrieval logic in `src/lib/ai.ts` to remove redundant headers. This resolved the LLM hallucination issue where trailing `】` characters were added to URLs.
    *   Updated E2E and unit tests to verify the enrichment logic and ensure retrieval stability.
    *   Updated `README.md` with detailed Supabase initialization and re-ingestion instructions.
    *   Added `supabase/clear-crawl-history.sql` helper script.

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
