import { test, expect } from "@playwright/test";

test("should allow a user to send a message and see it in the list", async ({
  page,
}) => {
  await page.goto("/");

  // 1. Find the input field and the send button.
  const messageInput = page.getByPlaceholder("Type your question...");
  const sendButton = page.getByRole("button", { name: "Send" });

  // 2. Type a message and click send.
  const testMessage = "Hello, world!";
  await messageInput.fill(testMessage);
  await sendButton.click();

  // 3. Assert that the message now appears in the message list.
  // We'll look for the message text within a list element.
  const messageList = page.getByRole("list");
  await expect(messageList).toBeVisible();
  await expect(messageList.getByText(testMessage)).toBeVisible();
});
