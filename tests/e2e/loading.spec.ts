import { test, expect } from "@playwright/test";

test.describe("Chat Loading Indicator", () => {
  test('should show "Stop Generating" button while streaming', async ({
    page,
  }) => {
    await page.goto("/");

    // Use the ARIA label to find the button for sending a message
    const sendButton = page.getByLabel("Send message");

    // Find the search form by its role, then find the text input within it.
    // This is very robust against changes to placeholder text or class names.
    const searchForm = page.getByRole("search");
    const chatInput = searchForm.locator('input[type="text"]');

    // Type a message and submit
    await chatInput.fill("Tell me a short story about a robot.");
    await sendButton.click();

    // The button's text/label will change, so we find it by its new role and name.
    const stopButton = page.getByRole("button", { name: "Stop Generating" });
    await expect(stopButton).toBeVisible({ timeout: 5000 });

    // The original send button (identified by its label) should no longer be in the DOM.
    await expect(sendButton).not.toBeVisible();

    // Wait for the stream to finish and verify the button reverts to its original state.
    await expect(stopButton).not.toBeVisible({ timeout: 30000 });
    await expect(sendButton).toBeVisible({ timeout: 30000 });
  });
});
