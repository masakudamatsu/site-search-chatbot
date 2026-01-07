import { test, expect, chromium, Browser } from "@playwright/test";
import { crawlPage, crawlWebsite, extractLinks } from "@/lib/crawler";

const pageWithMain = "https://www.wikipedia.org";
const pageWithoutMain = "https://www.google.com";
const pageWithPdfLinks =
  "https://www.export-japan.co.jp/solution_services/text_production/";
const redirectUrl = {
  origin: "https://www.export-japan.co.jp/solution_services/writing/",
  destination:
    "https://www.export-japan.co.jp/solution_services/text_production/",
};
test.describe("crawlPage()", () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("should extract content from the <main> tag", async () => {
    const result = await crawlPage(browser, pageWithMain);

    expect(result).not.toBeNull();
    // Check for content that is definitely in <main>
    expect(result?.content).toContain("The Free Encyclopedia");

    // Check for content that is definitely NOT in <main> (e.g., in the footer)
    expect(result?.content).not.toContain("Terms of Use");
  });

  test("should fall back to the <body> tag if <main> does not exist", async () => {
    const result = await crawlPage(browser, pageWithoutMain);

    expect(result).not.toBeNull();
    // Check for content that is definitely in <body>
    expect(result?.content).toContain("Google");
    // Check that we get something.
    expect(result!.content.length).toBeGreaterThan(0);
  });

  test("should return empty content for a 404 page", async () => {
    // This is a known dead link on the site
    const url = "https://info.cern.ch/hypertext/WWW/TkWWW/BUGS";
    const result = await crawlPage(browser, url);
    expect(result).toBeNull();
  });

  test("should extract title and meta description", async () => {
    const result = await crawlPage(browser, pageWithMain);

    expect(result).not.toBeNull();
    // Wikipedia's title usually contains "Wikipedia"
    expect(result?.title).toContain("Wikipedia");
    // Wikipedia has a meta description
    expect(result?.description).toContain("encyclopedia");
  });

  test("should follow redirects and return the final URL", async () => {
    const result = await crawlPage(browser, redirectUrl.origin);

    expect(result).not.toBeNull();
    // The returned URL should be the one after redirect
    expect(result?.url).toBe(redirectUrl.destination);
  });
});

test.describe("extractLinks()", () => {
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("should extract internal links and exclude external ones", async () => {
    const url = "http://info.cern.ch";
    const links = await extractLinks(browser, url);

    // Check that an internal link is included
    expect(links).toContain(
      "http://info.cern.ch/hypertext/WWW/TheProject.html"
    );

    // Check that an external link is NOT included
    expect(links).not.toContain("http://home.web.cern.ch/about");
  });

  test("should strip URL fragments from extracted links", async () => {
    const url = "http://info.cern.ch/hypertext/WWW/TheProject.html";
    const links = await extractLinks(browser, url);

    for (const link of links) {
      expect(link).not.toContain("#");
    }
  });

  test("should exclude PDF links", async () => {
    const links = await extractLinks(browser, pageWithPdfLinks);
    // Should NOT find the PDF
    expect(links.some((link) => link.endsWith(".pdf"))).toBe(false);
  });

  test("should exclude links with different ports (origins)", async () => {
    const url = "http://info.cern.ch";
    const links = await extractLinks(browser, url);
    // Should NOT find the link with port 8001 even though it starts with the same hostname
    expect(links).not.toContain(
      "http://info.cern.ch:8001/nnsc.nsf.net:210/internet-resource-guide?library"
    );
  });
});

test.describe("crawlWebsite()", () => {
  test("should crawl a website up to a specified limit", async () => {
    const startUrl = "http://info.cern.ch/";
    const numberOfPages = 5;

    // We'll use a Map to collect the pages during the crawl, restoring our ability to assert on content
    const pages = new Map<string, any>();
    const visited = await crawlWebsite(
      startUrl,
      numberOfPages,
      async (page) => {
        pages.set(page.url, page);
      }
    );

    // Check that we crawled the correct number of pages
    expect(visited.size).toBeGreaterThanOrEqual(numberOfPages);
    // CRITICAL ASSERTION: We must have successfully processed 'numberOfPages' valid pages
    // This should fail if the crawler counts 404s against the limit
    expect(pages.size).toBe(numberOfPages);

    // Check that the start page was visited
    expect(visited.has(startUrl)).toBe(true);
    expect(pages.get(startUrl)?.content).toContain("the first website");

    // Check that we have content from a linked page
    const linkedPageUrl = "http://info.cern.ch/hypertext/WWW/TheProject.html";
    expect(visited.has(linkedPageUrl)).toBe(true);
    expect(pages.get(linkedPageUrl)?.content).toContain(
      "The WorldWideWeb (W3)"
    );
  });

  test("should call onPageCrawled for each discovered page", async () => {
    const startUrl = "http://info.cern.ch/";
    const numberOfPages = 3;
    const crawledPages: string[] = [];

    await crawlWebsite(startUrl, numberOfPages, async (page) => {
      crawledPages.push(page.url);
    });

    // Check that the callback was called for each page
    expect(crawledPages.length).toBe(numberOfPages);
    // Check that the start page was processed
    expect(crawledPages).toContain(startUrl);
  });

  test("should handle redirects correctly with callbacks", async () => {
    // Crawl just the one page (limit 1)
    const pages = new Map<string, any>();
    const visited = await crawlWebsite(redirectUrl.origin, 1, async (page) => {
      pages.set(page.url, page);
    });
    // The processed PAGE content should only be associated with the final destination
    // because crawlPage returns the final URL
    expect(pages.has(redirectUrl.origin)).toBe(false);
    expect(pages.has(redirectUrl.destination)).toBe(true);
    // The visited Set tracks all URLs encountered, including redirects
    expect(visited.has(redirectUrl.origin)).toBe(true);
    expect(visited.has(redirectUrl.destination)).toBe(true);
  });
});
