import { chromium, Browser } from "playwright";

export interface PageData {
  url: string;
  title: string;
  description: string;
  content: string;
  lastModified?: string;
}

// crawlPage now accepts an existing browser instance
export async function crawlPage(
  browser: Browser,
  url: string
): Promise<PageData | null> {
  if (!url) {
    return null;
  }

  const page = await browser.newPage();
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    // Check if the page loaded successfully
    if (!response || !response.ok()) {
      console.warn(`Failed to load ${url}: Status ${response?.status()}`);
      await page.close();
      return null;
    }
    // Capture the final URL (after any redirects)
    const finalUrl = response.url();

    const data = await page.evaluate((finalUrl) => {
      const main = document.querySelector("main");
      const content = main ? main.innerText : document.body.innerText;
      const title = document.title;
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      const description = metaDescription
        ? (metaDescription as HTMLMetaElement).content
        : "";

      return {
        url: finalUrl,
        title,
        description,
        content,
      };
    }, finalUrl);

    return data;
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
    return null;
  } finally {
    await page.close();
  }
}

// extractLinks now accepts an existing browser instance
export async function extractLinks(
  browser: Browser,
  url: string
): Promise<string[]> {
  if (!url) {
    return [];
  }

  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const pageOrigin = new URL(url).origin;

    const links = await page.evaluate((pageOrigin) => {
      const allLinks = Array.from(document.querySelectorAll("a"));
      const internalLinks = new Set<string>();

      const ignoredExtensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".zip",
        ".docx",
        ".xlsx",
        ".pptx",
      ]; // crawler.spec.ts tests `.pdf` only, though

      for (const link of allLinks) {
        // Convert into absolute path by attaching `document.baseURI`, which is typically the current directory.
        const urlObj = new URL(link.href, document.baseURI);

        // Remove the hash from the URL
        urlObj.hash = "";
        const absoluteUrl = urlObj.href;
        const pathname = urlObj.pathname.toLowerCase();

        // Check if it ends with an ignored extension
        if (ignoredExtensions.some((ext) => pathname.endsWith(ext))) {
          continue;
        }

        // Keep link URLs only if it's in the same domain
        if (absoluteUrl.startsWith(pageOrigin)) {
          internalLinks.add(absoluteUrl);
        }
      }

      return Array.from(internalLinks);
    }, pageOrigin); // Pass the page's origin from Node.js to the browser context.

    return links;
  } catch (error) {
    console.error(`Failed to extract links from ${url}:`, error);
    return [];
  } finally {
    await page.close();
  }
}

// crawlWebsite now manages the browser lifecycle
export async function crawlWebsite(
  startUrl: string,
  limit: number = 1000,
  onPageCrawled?: (page: PageData) => Promise<void>
): Promise<Set<string>> {
  const browser = await chromium.launch();
  // URLs to visit
  const queue: string[] = [startUrl];
  // URLs that have already been processed
  const visited = new Set<string>();
  let crawledCount = 0;

  try {
    while (queue.length > 0 && crawledCount < limit) {
      const currentUrl = queue.shift()!; // Get the next URL to crawl

      if (visited.has(currentUrl)) {
        continue; // Skip if we've already visited this URL
      }

      console.log(`Crawling: ${currentUrl}`);
      // Mark the requested URL as visited
      visited.add(currentUrl);

      // 1. Get the content of the page with the shared browser instance
      const pageData = await crawlPage(browser, currentUrl);
      if (pageData) {
        crawledCount++;
        // Also mark the FINAL URL as visited to avoid re-crawling it later
        visited.add(pageData.url);

        // 2. Process page content with the callback
        if (onPageCrawled) {
          await onPageCrawled(pageData);
        }
        // 3. Find all the links on the page with the shared browser instance
        const links = await extractLinks(browser, pageData.url);
        // 4. Add new, unvisited links to the queue
        for (const link of links) {
          if (!visited.has(link)) {
            queue.push(link);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
  return visited;
}
