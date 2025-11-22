# Active Context

## Current Focus
With the core crawler functionality now robust, the immediate focus shifts to developing the data ingestion pipeline to process and store the collected content.

## Recently Completed
- **Initial Crawler Implementation**: Developed the core recursive crawling logic (`crawlWebsite`), page content extraction (`crawlPage`), and internal link discovery (`extractLinks`).
- **Integration Test Suite**: Created a comprehensive set of tests for the crawler's functionality.
- **Extension-based Content Filtering**: Added logic to `extractLinks` to ignore URLs with non-HTML file extensions.
- **Metadata Extraction**: Updated the crawler to extract page titles and meta descriptions.
- **Redirect Handling**: The crawler now correctly handles HTTP redirects, storing content under the final canonical URL to prevent duplicates.

## Next Steps
- **Data Ingestion Pipeline**: Develop the pipeline to take crawled `PageData`, split it into chunks, generate embeddings, and store it in the vector database.

## Deferred Crawler Enhancements
- **Query Parameter Normalization**: Strip common tracking parameters from URLs to prevent duplicate content indexing.
- **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
- **Rate Limiting**: Introduce a polite delay between requests to avoid overwhelming the target server.
- **Robust Content-Type Check**: Implement header-based filtering in `crawlPage` to handle dynamic URLs (without extensions) that serve non-HTML content.
