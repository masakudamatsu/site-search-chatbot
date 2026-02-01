import { test, expect } from "@playwright/test";

test.describe("Chat Loading Indicator", () => {
  test("should show loading state correctly while streaming", async ({
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
    // The input should be disabled.
    await expect(chatInput).toBeDisabled();

    // Wait for the stream to finish and verify the button reverts to its original state.
    await expect(stopButton).not.toBeVisible({ timeout: 30000 });
    await expect(sendButton).toBeVisible({ timeout: 30000 });
    // The input should be enabled again.
    await expect(chatInput).toBeEnabled({ timeout: 30000 });
  });
  test("should show typing indicator while submitting", async ({ page }) => {
    await page.goto("/");

    const sendButton = page.getByLabel("Send message");
    const searchForm = page.getByRole("search");
    const messageInput = searchForm.locator('input[type="text"]');

    // Type a message and submit
    await messageInput.fill("Why is the sky blue?");
    await sendButton.click();

    // Find the indicator by its accessible, screen-reader-only text.
    const typingIndicator = page.getByText("Preparing an answer...");
    await expect(typingIndicator).toBeVisible();

    // Wait for the streaming to start and the AI response to appear.
    // Once the AI message appears, the typing indicator should be gone.
    const messageList = page.getByRole("list");
    const aiMessage = messageList.locator("li").nth(1); // The second message in the list
    await expect(aiMessage).toBeVisible({ timeout: 30000 });
    await expect(typingIndicator).not.toBeVisible();
  });
  test.only("should show blinking cursor while streaming and hide it when done", async ({
    page,
  }) => {
    await page.goto("/");

    const sendButton = page.getByLabel("Send message");
    const searchForm = page.getByRole("search");
    const messageInput = searchForm.locator('input[type="text"]');

    await messageInput.fill("Tell me a very short story.");
    await sendButton.click();

    // 1. Wait for the typing indicator to appear first.
    const typingIndicator = page.getByText("Preparing an answer...");
    await expect(typingIndicator).toBeVisible();

    // 2. Now, wait for the typing indicator to disappear. This is our key event.
    await expect(typingIndicator).not.toBeVisible({ timeout: 30000 });

    // 3. Immediately after the indicator is gone, the blinking cursor should be visible.
    const blinkingCursor = page.getByText("More to come. Please wait.");
    await expect(blinkingCursor).toBeVisible();

    // 4. Wait for the stream to complete by waiting for the "Stop Generating" button to disappear.
    const stopButton = page.getByRole("button", { name: "Stop Generating" });
    await expect(stopButton).not.toBeVisible({ timeout: 30000 });

    // 5. Once the stream is finished, the cursor should be gone.
    await expect(blinkingCursor).not.toBeVisible();
  });
});
