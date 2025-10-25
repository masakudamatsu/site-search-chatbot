# Active Context

## Current Focus
Enhance the user experience by implementing a multi-stage loading indicator that provides clear feedback while the chatbot is generating a response.

## Next Steps
1.  **Initial Loading State:** When a message is submitted, display a typing indicator (an animated three-dot ellipsis) in the message list and replace the "Submit" button with a "Stop Generating" button.
2.  **Streaming State:** As soon as the first tokens of the AI's response arrive, replace the typing indicator with the streaming text, appended with a blinking cursor to show that more text is coming.
3.  **Final State:** Once the response stream is complete, remove the blinking cursor from the message and revert the "Stop Generating" button back to the "Submit" button.
4.  **Future Work:** Once the loading indicator is implemented, the next major feature will be the web crawling and data ingestion pipeline.
