import { test, expect } from "@playwright/test";
import { crawlPage, crawlWebsite, extractLinks } from "@/lib/crawler";

const pageWithMain = "https://www.wikipedia.org";
const pageWithoutMain = "https://www.google.com";

test.describe("crawlPage()", () => {
  test("should extract content from the <main> tag", async () => {
    const content = await crawlPage(pageWithMain);

    // Check for content that is definitely in <main>
    expect(content).toContain("The Free Encyclopedia");

    // Check for content that is definitely NOT in <main> (e.g., in the footer)
    expect(content).not.toContain("Terms of Use");
  });

  test("should fall back to the <body> tag if <main> does not exist", async () => {
    const content = await crawlPage(pageWithoutMain);

    // Check for content that is definitely in <body>
    expect(content).toContain("Google");

    // Check that we get something.
    expect(content.length).toBeGreaterThan(0);
  });

  test("should return empty content for a 404 page", async () => {
    // This is a known dead link on the site
    const url = "https://info.cern.ch/hypertext/WWW/TkWWW/BUGS";
    const content = await crawlPage(url);
    expect(content).toBe("");
  });
});

test.describe("extractLinks()", () => {
  test("should extract internal links and exclude external ones", async () => {
    const url = "http://info.cern.ch";
    const links = await extractLinks(url);

    // Check that an internal link is included
    expect(links).toContain(
      "http://info.cern.ch/hypertext/WWW/TheProject.html"
    );

    // Check that an external link is NOT included
    expect(links).not.toContain("http://home.web.cern.ch/about");
  });

  test("should strip URL fragments from extracted links", async () => {
    const url = "http://info.cern.ch/hypertext/WWW/TheProject.html";
    const links = await extractLinks(url);

    for (const link of links) {
      expect(link).not.toContain("#");
    }
  });
});

test.describe("crawlWebsite()", () => {
  test("should crawl a website up to a specified limit", async () => {
    const startUrl = "http://info.cern.ch";
    const numberOfPages = 5;
    // Crawl only 5 pages to keep the test fast
    const siteContent = await crawlWebsite(startUrl, numberOfPages);

    // Check that we crawled a reasonable number of pages
    expect(siteContent.size).toBe(numberOfPages);

    // Check that we have content from the start page
    expect(siteContent.has(startUrl)).toBe(true);
    expect(siteContent.get(startUrl)).toContain("the first website");

    // Check that we have content from a linked page
    const linkedPageUrl = "http://info.cern.ch/hypertext/WWW/TheProject.html";
    expect(siteContent.has(linkedPageUrl)).toBe(true);
    expect(siteContent.get(linkedPageUrl)).toContain("The WorldWideWeb (W3)");
  });
});
