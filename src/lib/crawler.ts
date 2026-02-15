import { Browser } from "playwright-core";

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
  url: string,
  startOrigin?: string,
  visited?: Set<string>,
): Promise<PageData | null> {
  if (!url) {
    return null;
  }

  const page = await browser.newPage();
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 10000, // reduced from the default 30000ms
    });

    // Check if the page loaded successfully
    if (!response || !response.ok()) {
      console.warn(`Failed to load ${url}: Status ${response?.status()}`);
      await page.close();
      return null;
    }
    // Capture the final URL (after any redirects)
    const finalUrl = response.url();
    if (finalUrl !== url) {
      console.log(`Redirected to: ${finalUrl}`);

      // Enforce same-origin policy for redirects BEFORE scraping
      if (startOrigin && new URL(finalUrl).origin !== startOrigin) {
        console.warn(`Ingestion skipped due to off-origin redirect`);
        return null;
      }

      // Skip scraping if the final URL has already been visited
      if (visited && visited.has(finalUrl)) {
        console.log(`Ingestion skipped due to already visited redirect`);
        return null;
      }
    }

    const lastModified = response.headers()["last-modified"]; // to check whether to crawl again

    const data = await page.evaluate(
      ({ finalUrl, lastModified }) => {
        const main = document.querySelector("main");
        const content = main ? main.innerText : document.body.innerText;
        const title = document.title;
        const metaDescription = document.querySelector(
          'meta[name="description"]',
        );
        const description = metaDescription
          ? (metaDescription as HTMLMetaElement).content
          : "";

        return {
          url: finalUrl,
          title,
          description,
          content,
          lastModified,
        };
      },
      { finalUrl, lastModified },
    );

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
  url: string,
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

        // Keep link URLs only if it's in the same origin
        if (urlObj.origin === pageOrigin) {
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

// Helper to get the correct browser instance based on the environment
async function getBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    // Production (Vercel)
    const chromium = require("@sparticuz/chromium-min");
    const { chromium: playwright } = require("playwright-core");

    // Dynamically detect architecture to select the correct binary pack
    const arch = process.arch === "arm64" ? "arm64" : "x64";
    console.log(`Detected architecture: ${process.arch}, using ${arch} pack.`);

    const packUrl = `https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.${arch}.tar`;

    return await playwright.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(packUrl),
      headless: chromium.headless,
    });
  } else {
    // Local development
    const { chromium } = require("playwright");
    return await chromium.launch();
  }
}

// crawlWebsite now manages the browser lifecycle
export async function crawlWebsite(
  startUrl: string,
  limit: number = 1000,
  onPageCrawled?: (page: PageData) => Promise<void>,
): Promise<Set<string>> {
  const browser = await getBrowser();
  const startOrigin = new URL(startUrl).origin;

  // URLs to visit (using a Set to automatically prevent duplicate queuing)
  const queue = new Set<string>([startUrl]);
  // URLs that have already been processed
  const visited = new Set<string>();
  let crawledCount = 0;

  try {
    while (queue.size > 0 && crawledCount < limit) {
      // Get the next URL to crawl (FIFO order preserved by Set iterator)
      const currentUrl = queue.values().next().value;
      queue.delete(currentUrl);

      if (visited.has(currentUrl)) {
        continue; // Skip if we've already visited this URL
      }

      // 1. Get the content of the page with the shared browser instance
      console.log(`Crawling: ${currentUrl}`);
      // Mark the requested URL as visited
      visited.add(currentUrl);
      const pageData = await crawlPage(
        browser,
        currentUrl,
        startOrigin,
        visited,
      );
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
            queue.add(link);
          }
        }
      }
      console.log(
        `${Math.round((visited.size / (visited.size + queue.size)) * 100)}% complete (${visited.size} pages have been crawled)`,
      );
    }
  } finally {
    await browser.close();
  }
  return visited;
}
