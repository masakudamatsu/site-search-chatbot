# Active Context

## Primary Goal
Our top priority is to finish building a usable, self-contained prototype of the application as quickly as possible. The core workflow will be for a user to provide a website URL, trigger a one-time ingestion, and then immediately begin asking questions of the chatbot.

## Current Focus Chain
To achieve the primary goal, we are implementing the following features in sequence:

1.  **Integrate RAG into the Chat API (Current Focus):**
    *   Modify the chat API to use the `getRelevantContext` function and inject the retrieved context into the LLM prompt.
2.  **Write Full E2E Test:**
    *   Create a new Playwright test to verify the entire UI-driven ingestion and Q&A flow.

## Recently Completed
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
- **Refactor Integration Tests**: Convert the remaining Playwright-based integration tests in `tests/integration` to use Vitest for consistency and better mocking capabilities.
- **Streaming Ingestion UI**: Refactor the ingestion process to use a streaming response, providing real-time progress updates (e.g., "Crawled 5 of 50 pages") to the user.
- **Automated Ingestion**: Set up a Vercel Cron Job to trigger the `/api/ingest` endpoint on a schedule.
- **Crawler Robustness**:
    - **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
    - **Rate Limiting**: Introduce a polite delay between requests.
    - **Query Parameter Normalization**: Strip common tracking parameters from URLs.
    - **Robust Content-Type Check**: Implement header-based filtering for dynamic URLs.
