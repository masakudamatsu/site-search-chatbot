import { chromium } from "playwright";

export async function crawlPage(url: string): Promise<string> {
  if (!url) {
    return "";
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
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
