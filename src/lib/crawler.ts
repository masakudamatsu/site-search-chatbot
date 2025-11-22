import { chromium } from "playwright";

export interface PageData {
  url: string;
  title: string;
  description: string;
  content: string;
}

export async function crawlPage(url: string): Promise<PageData | null> {
  if (!url) {
    return null;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    // Check if the page loaded successfully
    if (!response || !response.ok()) {
      console.warn(`Failed to load ${url}: Status ${response?.status()}`);
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
    await browser.close();
  }
}

export async function extractLinks(url: string): Promise<string[]> {
  if (!url) {
    return [];
  }

  const browser = await chromium.launch();
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
    await browser.close();
  }
}

export async function crawlWebsite(
  startUrl: string,
  limit: number = 1000 // Upper limit of number of pages to crawl
): Promise<Map<string, PageData>> {
  // Return value
  const siteContent = new Map<string, PageData>();

  // URLs to visit
  const queue: string[] = [startUrl];
  // URLs that have already been processed
  const visited = new Set<string>();

  while (queue.length > 0 && siteContent.size < limit) {
    const currentUrl = queue.shift()!; // Get the next URL to crawl

    if (visited.has(currentUrl)) {
      continue; // Skip if we've already visited this URL
    }

    console.log(`Crawling: ${currentUrl}`);
    // Mark the requested URL as visited
    visited.add(currentUrl);

    // 1. Get the content of the page
    const pageData = await crawlPage(currentUrl);
    if (pageData) {
      // Store content under the FINAL URL
      siteContent.set(pageData.url, pageData);
      // Also mark the FINAL URL as visited to avoid re-crawling it later
      visited.add(pageData.url);
      // 2. Find all the links on the page
      const links = await extractLinks(pageData.url);
      // 3. Add new, unvisited links to the queue
      for (const link of links) {
        if (!visited.has(link)) {
          queue.push(link);
        }
      }
    }
  }
  return siteContent;
}
