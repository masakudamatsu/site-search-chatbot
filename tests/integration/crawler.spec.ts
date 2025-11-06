import { test, expect } from "@playwright/test";
import { crawlPage, extractLinks } from "@/lib/crawler";

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
});
