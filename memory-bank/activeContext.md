# Active Context

## Current Focus
Integrate the crawler with the ingestion pipeline using real clients for Supabase and Together.ai.

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
1.  **Dependencies**: Install `@supabase/supabase-js`.
2.  **Enhance Crawler**: Update `crawlWebsite` in `src/lib/crawler.ts` to accept an optional `onPageCrawled` callback for immediate processing of crawled pages.
3.  **Implement Real Services**:
    - Create `src/lib/supabase.ts` to initialize and export the Supabase client.
    - Create `src/lib/ai.ts` to configure the Together AI provider for embedding generation (using `baai/bge-large-en-v1.5`).
4.  **Create Ingestion Endpoint**: Develop `src/app/api/ingest/route.ts` to orchestrate the entire crawl-and-ingest process.
5.  **Set up Cron Job**: Configure a Vercel Cron Job to trigger the ingestion endpoint regularly.

## Deferred Crawler Enhancements
- **Query Parameter Normalization**: Strip common tracking parameters from URLs to prevent duplicate content indexing.
- **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
- **Rate Limiting**: Introduce a polite delay between requests to avoid overwhelming the target server.
- **Robust Content-Type Check**: Implement header-based filtering in `crawlPage` to handle dynamic URLs (without extensions) that serve non-HTML content.
