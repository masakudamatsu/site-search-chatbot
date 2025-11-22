# Active Context

## Current Focus
Our primary focus is to productionize the web crawler by addressing key edge cases. The initial version is complete, but it needs to handle real-world complexities like non-HTML content and `robots.txt` before it can be considered robust.

## Recently Completed
- **Initial Crawler Implementation**: Developed the core recursive crawling logic (`crawlWebsite`), page content extraction (`crawlPage`), and internal link discovery (`extractLinks`).
- **Integration Test Suite**: Created a comprehensive set of tests for the crawler's functionality.
- **Extension-based Content Filtering**: Added logic to `extractLinks` to ignore URLs with non-HTML file extensions.

## Next Steps
1.  **Query Parameter Normalization**: Strip common tracking parameters from URLs to prevent duplicate content indexing.
2.  **`robots.txt` Compliance**: Add support for parsing and respecting `robots.txt` rules.
3.  **Rate Limiting**: Introduce a polite delay between requests to avoid overwhelming the target server.
4.  **Metadata Extraction**: Enhance the crawler to extract page titles and meta descriptions alongside the main content.
5.  **Robust Content-Type Check (Deferred)**: Implement header-based filtering in `crawlPage` to handle dynamic URLs (without extensions) that serve non-HTML content.
