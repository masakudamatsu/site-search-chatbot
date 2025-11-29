# Active Context

## Primary Goal
Our top priority is to finish building a usable, self-contained prototype of the application as quickly as possible. The core workflow will be for a user to provide a website URL, trigger a one-time ingestion, and then immediately begin asking questions of the chatbot.

## Current Focus Chain
To achieve the primary goal, we are implementing the following features in sequence:

1.  **Add a "Load Website" UI to the Frontend (Current Focus):**
    *   Add an input field and "Load" button to the main page.
    *   Implement client-side logic to call the `/api/ingest` endpoint.
    *   Display status feedback to the user during ingestion.
2.  **Implement Vector Search Logic:**
    *   Create a function to handle question embedding and the Supabase vector search.
3.  **Integrate RAG into the Chat API:**
    *   Modify the chat API to use the vector search function and inject the retrieved context into the LLM prompt.
4.  **Write E2E Test for the Full Flow:**
    *   Create a single Playwright test to verify the entire UI-driven ingestion and Q&A flow.

## Recently Completed
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
- **Automated Ingestion**: Set up a Vercel Cron Job to trigger the `/api/ingest` endpoint on a schedule.
- **Crawler Robustness**:
    - **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
    - **Rate Limiting**: Introduce a polite delay between requests.
    - **Query Parameter Normalization**: Strip common tracking parameters from URLs.
    - **Robust Content-Type Check**: Implement header-based filtering for dynamic URLs.
