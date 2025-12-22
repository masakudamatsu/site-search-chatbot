# Active Context

## Primary Goal
Our top priority is to finish building a usable, self-contained prototype of the application as quickly as possible. The core workflow will be for a user to provide a website URL, trigger a one-time ingestion, and then immediately begin asking questions of the chatbot.

## Current Focus Chain
We are transitioning from the prototype phase to a more robust, production-ready system.

1.  **Implement Smart Ingestion & Automation (Current Focus):**
    *   **Goal**: Optimize ingestion to skip unchanged pages and automate the process.
    *   **Plan**:
        *   **Database**: Create `crawled_pages` table (`url`, `last_modified`, `content_hash`) to track page state.
        *   **Crawler**: Update `src/lib/crawler.ts` to capture the `Last-Modified` HTTP header.
        *   **Ingestion Logic**: Update `src/lib/ingestion.ts` to implement a two-step check (Date & Checksum) before re-embedding.
        *   **API**: Secure `/api/ingest` with `CRON_SECRET` and use `TARGET_URL` from environment variables.
        *   **Automation**: Create `vercel.json` to schedule the cron job (e.g., daily).
        *   **Frontend**: Remove the manual "Load Website" UI.
2.  **Enhance Answer Quality:**
    *   Implement **Context Enrichment** (prepending page titles to chunks) to improve RAG precision.
3.  **Cleanup:**
    *   Remove the manual ingestion UI from the frontend.

## Recently Completed
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
- **Enhance Answer Quality**:
    *   **Context Enrichment**: Prepend page titles to every text chunk during ingestion. This adds semantic context to isolated segments (e.g., a list of names) and significantly improves retrieval ranking.
    *   **Re-ranking**: For larger datasets, implement a re-ranking step (fetch 50, re-rank top 10) using a specialized model.
- **Refactor Integration Tests**: Convert the remaining Playwright-based integration tests in `tests/integration` to use Vitest for consistency and better mocking capabilities.
- **Streaming Ingestion UI**: Refactor the ingestion process to use a streaming response, providing real-time progress updates (e.g., "Crawled 5 of 50 pages") to the user.
- **Automated Ingestion**: Set up a Vercel Cron Job to trigger the `/api/ingest` endpoint on a schedule.
- **Crawler Robustness**:
    - **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
    - **Rate Limiting**: Introduce a polite delay between requests.
    - **Query Parameter Normalization**: Strip common tracking parameters from URLs.
    - **Robust Content-Type Check**: Implement header-based filtering for dynamic URLs.
