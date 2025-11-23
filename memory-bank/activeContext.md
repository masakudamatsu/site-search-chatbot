# Active Context

## Current Focus
With the core crawler functionality now robust, the immediate focus shifts to developing the data ingestion pipeline to process and store the collected content.

## Recently Completed
- **Initial Crawler Implementation**: Developed the core recursive crawling logic (`crawlWebsite`), page content extraction (`crawlPage`), and internal link discovery (`extractLinks`).
- **Integration Test Suite**: Created a comprehensive set of tests for the crawler's functionality.
- **Extension-based Content Filtering**: Added logic to `extractLinks` to ignore URLs with non-HTML file extensions.
- **Metadata Extraction**: Updated the crawler to extract page titles and meta descriptions.
- **Redirect Handling**: The crawler now correctly handles HTTP redirects, storing content under the final canonical URL to prevent duplicates.

## Next Steps: Implement the Data Ingestion Pipeline

The development will proceed in four distinct steps, following a Test-Driven Development (TDD) approach.

*   **Step 1: Foundational Setup**
    *   Create a new test suite (`tests/integration/ingestion.spec.ts`) for the data ingestion logic.
    *   Define the data structures for processed and chunked content.
    *   Set up mock services for Supabase and the Together.ai embedding API to ensure fast and isolated tests.
*   **Step 2: Content Processing**
    *   Implement text splitting using LangChain.js.
    *   Implement the embedding generation logic.
*   **Step 3: Database Interaction**
    *   Implement the logic to store the embeddings and content chunks in the Supabase vector database.
*   **Step 4: Integration**
    *   Create the main function that orchestrates the entire pipeline: from receiving crawled data to storing it in the database.
    *   Integrate the pipeline with the existing crawler.

## Deferred Crawler Enhancements
- **Query Parameter Normalization**: Strip common tracking parameters from URLs to prevent duplicate content indexing.
- **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
- **Rate Limiting**: Introduce a polite delay between requests to avoid overwhelming the target server.
- **Robust Content-Type Check**: Implement header-based filtering in `crawlPage` to handle dynamic URLs (without extensions) that serve non-HTML content.
