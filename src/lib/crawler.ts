import { chromium } from "playwright";

export async function crawlPage(url: string): Promise<string> {
  if (!url) {
    return "";
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    // Check if the page loaded successfully
    if (!response || !response.ok()) {
      console.warn(`Failed to load ${url}: Status ${response?.status()}`);
      return "";
    }
    const content = await page.evaluate(() => {
      const main = document.querySelector("main");
      if (main) {
        return main.innerText;
      }
      return document.body.innerText;
    });

    return content;
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
    return "";
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

      for (const link of allLinks) {
        // Convert into absolute path by attaching `document.baseURI`, which is typically the current directory.
        const urlObj = new URL(link.href, document.baseURI);

        // Remove the hash from the URL
        urlObj.hash = "";
        const absoluteUrl = urlObj.href;

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
