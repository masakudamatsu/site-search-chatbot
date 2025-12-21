# System Patterns

## Core Architecture
The application will be a monolithic Next.js application, containing both the frontend chat interface and the backend services for crawling, embedding, and querying. This integrated approach is suitable for the proof-of-concept and allows for future modularization.

## Web Crawling and Data Ingestion
1.  **Initiation:** A Vercel Cron Job triggers the crawling process periodically.
2.  **Crawling:** A Playwright-based crawler starts at the provided homepage URL. It navigates through the website, respecting `robots.txt` and staying within the same domain. It extracts the textual content from each page, handling JavaScript-rendered content.
3.  **Content Update Strategy:**
    - **Date Check:** The crawler first checks for `Last-Modified` headers or meta tags to quickly identify unchanged pages.
    - **Checksum:** For pages with new dates, the content is downloaded, and a checksum (hash) is calculated.
    - **Embedding:** If the checksum differs from the stored one, the new content is sent to the Together.ai API to generate embeddings.
4.  **Storage:** The generated embeddings and the corresponding page content are stored in a Supabase pgvector database.
    - **Deduplication:** Before inserting new embeddings for a page, existing embeddings for that URL are deleted to prevent duplication.

## Query and Response Flow
1.  **User Input:** The user sends a question through the Next.js frontend.
2.  **Embedding:** The backend creates an embedding of the user's question using the Together.ai API.
3.  **Vector Search:** The backend queries the Supabase pgvector database to find the most relevant text chunks.
    - **Parameters:** It uses a `match_threshold` of 0.5 and retrieves the top 10 matches to ensure diversity and inclusion of specific but lower-ranked documents (e.g. lists of names).
4.  **LLM Prompting:** The user's question, the chat history, and the retrieved text chunks are formatted into a prompt for the `gpt-oss-20b` model hosted on Together.ai.
    - **System Prompt:** Explicitly instructs the LLM to cite sources using Markdown links and attributes information strictly to the provided chunk's source URL.
5.  **Streaming Response:** The response from the LLM is streamed back to the user interface using the Vercel AI SDK, providing a real-time, interactive experience.

## Testing Patterns
- **Parallel E2E Testing:** To avoid database collisions in parallel workers (where multiple tests might ingest data for the same URL simultaneously), we inject **unique identifiers** into both the ingested content and the test query. This ensures that the RAG retrieval finds the specific document ingested by that worker, even if other workers have ingested similar content.
