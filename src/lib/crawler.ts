import { chromium } from "playwright";

export async function crawlPage(url: string): Promise<string> {
  if (!url) {
    return "";
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // For the initial implementation, we'll extract the inner text of the body.
    // We can make this more sophisticated later.
    const content = await page.evaluate(() => document.body.innerText);

    return content;
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
    return "";
  } finally {
    await browser.close();
  }
}
