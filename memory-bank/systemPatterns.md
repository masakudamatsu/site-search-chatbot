# System Patterns

## Core Architecture
The application will be a monolithic Next.js application, containing both the frontend chat interface and the backend services for crawling, embedding, and querying. This integrated approach is suitable for the proof-of-concept and allows for future modularization.

## Web Crawling and Data Ingestion
1.  **Initiation:** A Vercel Cron Job (configured via `vercel.json` and secured with `CRON_SECRET`) triggers the crawling process periodically.
2.  **Crawling:** A Playwright-based crawler starts at the `TARGET_URL`. It navigates through the website, respecting `robots.txt` and staying within the same domain. It extracts the textual content and `Last-Modified` headers from each page.
    *   **Browser Management**: The system uses a conditional loader to handle environment differences. Locally, it uses standard Playwright for debugging and speed. In production (Vercel), it uses `@sparticuz/chromium` and `playwright-core` to stay within serverless size and binary constraints.
    *   **Progress Tracking**: The crawler provides real-time logging of ingestion progress (processed vs. total discovered URLs) to provide visibility during long-running tasks.
3.  **Smart Ingestion Strategy:**
    - **Tracking:** A `crawled_pages` table stores the `url`, `last_modified` header, and `content_hash` for every processed page.
    - **Date Check:** Before processing, the system checks if the `Last-Modified` header matches the stored value. If it matches, the page is skipped.
    - **Checksum Check:** If the date differs (or is missing), the system computes a SHA-256 hash of the page content. If this hash matches the stored `content_hash`, the page is skipped to save embedding costs.
    - **Re-embedding:** Only if both checks fail (implying new or changed content) does the system generate embeddings using the Together.ai API.
    - **Origin Strictness:** During crawling, the system verifies that the final URL after any redirects still matches the original target origin to prevent leakage to external domains.
    - **Redundant Redirect Skip**: If a redirect lands on a URL that has already been visited, the system skips scraping that page. Both this and the origin check happen inside `crawlPage` immediately after navigation to optimize performance.
    - **Set-based Queue**: The URL queue is implemented as a `Set` to automatically handle duplicate URL discovery and provide accurate progress metrics.
4.  **Storage:**
    - **Embeddings:** Stored in the `documents` table (pgvector).
    - **State:** Page metadata is updated in the `crawled_pages` table.
    - **Deduplication:** Existing embeddings for the URL are deleted before inserting new ones.

## Query and Response Flow
1.  **User Input:** The user sends a question through the Next.js frontend.
2.  **Embedding:** The backend creates an embedding of the user's question using the Together.ai API.
3.  **Vector Search:** The backend queries the Supabase pgvector database (using 1024-dimension vectors) to find the most relevant text chunks.
    - **Parameters:** It uses a `match_threshold` of 0.5 and retrieves the top 10 matches to ensure diversity and inclusion of specific but lower-ranked documents (e.g. lists of names).
4.  **LLM Prompting:** The user's question, the chat history, and the retrieved text chunks are formatted into a prompt for the `gpt-oss-20b` model hosted on Together.ai.
    - **System Prompt:** Explicitly instructs the LLM to cite sources using Markdown links and attributes information strictly to the provided chunk's source URL.
5.  **Streaming Response:** The response from the LLM is streamed back to the user interface using the Vercel AI SDK, providing a real-time, interactive experience.

## Testing Patterns
- **Parallel E2E Testing:** To avoid database collisions in parallel workers (where multiple tests might ingest data for the same URL simultaneously), we inject **unique identifiers** into both the ingested content and the test query. This ensures that the RAG retrieval finds the specific document ingested by that worker, even if other workers have ingested similar content.
- **Database Safety & Cleanup:**
    - **Principle**: Tests must leave the database in the same state they found it.
    - **Cleanup Rule**: When adding a new database table, all integration/E2E tests that write to the database must be updated to clean up that new table in their `afterAll` hooks.
    - **Targeted Deletion**: Always use targeted delete commands (e.g., `.eq("url", testUrl)` or `.like("url", "domain%")`) rather than wiping entire tables (e.g., `.neq("id", -1)`). This protects development data and allows tests to run safely in shared environments.
