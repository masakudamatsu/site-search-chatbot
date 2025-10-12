# Playwright Guidelines

## Core Documentation

For any tasks involving Playwright, refer to the official documentation as your primary source.

- **Installation**: https://playwright.dev/docs/intro
- **Writing Tests (Core Concepts)**: https://playwright.dev/docs/writing-tests
  - **Locators**: https://playwright.dev/docs/locators (Essential for selecting elements)
  - **Assertions**: https://playwright.dev/docs/test-assertions (Essential for verifying test outcomes)
- **Web Scraping / Crawling**: https://playwright.dev/docs/crawling-and-scraping
- **Running Tests**: https://playwright.dev/docs/running-tests
- **Test Configuration**: https://playwright.dev/docs/test-configuration
- **API Reference**: https://playwright.dev/docs/api/class-playwright

## Instructions

- **Locator Strategy**: Prioritize user-facing locators in the following order:
  1.  `getByRole()`: For roles like 'button', 'heading', 'listitem', etc. This is the preferred method.
  2.  `getByLabel()`: For form fields associated with a `<label>`.
  3.  `getByPlaceholder()`: For inputs with placeholder text.
  4.  `getByText()`: For finding elements by their text content.
  5.  `getByTestId()`: As a last resort for elements that are hard to select otherwise. Avoid `locator()` with CSS or XPath selectors unless absolutely necessary, as it makes tests more brittle.
- Adhere strictly to the configuration options and API usage described in the above linked documentation.
- Do not use deprecated or non-existent configuration options from your training data. The URLs above contain the most current information.
- If you get 404 errors by visiting the above URL links, please stop and report. You'll be given an instruction on where to look at instead.
