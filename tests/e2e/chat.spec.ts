import { test, expect } from "@playwright/test";

test("should allow a user to send a message and receive a response from the AI", async ({
  page,
}) => {
  await page.goto("/");

  // 1. Find the input field and the send button using robust selectors.
  const sendButton = page.getByLabel("Send message");
  const searchForm = page.getByRole("search");
  const messageInput = searchForm.locator('input[type="text"]');

  // 2. Type a message and click send.
  const testMessage = "What is the capital of France?";
  await messageInput.fill(testMessage);
  await sendButton.click();

  // 3. Assert that the user's message now appears in the message list.
  const messageList = page.getByRole("list");
  const userMessage = messageList.getByText(testMessage);
  await expect(userMessage).toBeVisible();

  // 4. Assert that a second message from the AI appears.
  // We will check that the number of list items becomes 2.
  const allMessages = messageList.getByRole("listitem");
  await expect(allMessages).toHaveCount(2);

  // 5. Optional: We can also assert that the AI's message is not empty.
  const aiMessage = allMessages.nth(1); // The second message
  await expect(aiMessage).not.toBeEmpty();
});
