# Active Context

## Current Focus
With the core crawler functionality now robust, the immediate focus shifts to developing the data ingestion pipeline to process and store the collected content.

## Recently Completed
- **Data Ingestion Pipeline**:
    - Implemented `processPage` for text splitting using LangChain.
    - Implemented `generateEmbeddings` for vectorization (with mock testing).
    - Implemented `storeEmbeddings` for database storage (with mock testing).
    - Created an `ingestData` orchestrator to run the full pipeline.
    - Followed TDD, creating a comprehensive integration test suite for the pipeline.
- **Initial Crawler Implementation**: Developed the core recursive crawling logic (`crawlWebsite`), page content extraction (`crawlPage`), and internal link discovery (`extractLinks`).
- **Integration Test Suite**: Created a comprehensive set of tests for the crawler's functionality.
- **Extension-based Content Filtering**: Added logic to `extractLinks` to ignore URLs with non-HTML file extensions.
- **Metadata Extraction**: Updated the crawler to extract page titles and meta descriptions.
- **Redirect Handling**: The crawler now correctly handles HTTP redirects, storing content under the final canonical URL to prevent duplicates.

## Next Steps
- **Integrate Crawler with Ingestion Pipeline**: Modify the crawler to call `ingestData` for each crawled page, using real clients for embeddings and the database.
- **Implement Real Services**: Create real implementations for the `EmbeddingGenerator` (using Together.ai) and `SupabaseClient` (using `@supabase/supabase-js`).
- **Cron Job**: Set up the Vercel cron job to trigger the full crawl-and-ingest process.

## Deferred Crawler Enhancements
- **Query Parameter Normalization**: Strip common tracking parameters from URLs to prevent duplicate content indexing.
- **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
- **Rate Limiting**: Introduce a polite delay between requests to avoid overwhelming the target server.
- **Robust Content-Type Check**: Implement header-based filtering in `crawlPage` to handle dynamic URLs (without extensions) that serve non-HTML content.
