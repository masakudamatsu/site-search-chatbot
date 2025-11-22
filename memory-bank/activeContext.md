# Active Context

## Current Focus
Our immediate focus is to enhance the crawler's data collection capabilities by adding metadata extraction (titles, descriptions) and ensuring it correctly handles HTTP redirects to avoid duplicate content.

## Recently Completed
- **Initial Crawler Implementation**: Developed the core recursive crawling logic (`crawlWebsite`), page content extraction (`crawlPage`), and internal link discovery (`extractLinks`).
- **Integration Test Suite**: Created a comprehensive set of tests for the crawler's functionality.
- **Extension-based Content Filtering**: Added logic to `extractLinks` to ignore URLs with non-HTML file extensions.

## Next Steps
1.  **Metadata Extraction**: Enhance the crawler to extract page titles and meta descriptions alongside the main content.
2.  **Redirect Handling**: Ensure the crawler tracks the final URL after redirects to prevent duplicate processing.
3.  **Query Parameter Normalization (Deferred)**: Strip common tracking parameters from URLs to prevent duplicate content indexing.
4.  **`robots.txt` Compliance (Deferred)**: Add support for parsing and respecting `robots.txt` rules.
5.  **Rate Limiting (Deferred)**: Introduce a polite delay between requests to avoid overwhelming the target server.
6.  **Robust Content-Type Check (Deferred)**: Implement header-based filtering in `crawlPage` to handle dynamic URLs (without extensions) that serve non-HTML content.
