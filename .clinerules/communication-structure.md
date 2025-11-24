## Brief overview
This file defines the preferred structure for AI responses to clearly distinguish between internal reasoning and the final answer/conclusion, improving readability for the user.

## Structural Headings
-   **Clear Separation**: The user interface displays the AI's internal thinking process and the final tool output as a continuous stream. To separate them:
    -   **Reasoning**: Start the internal `<thinking>` block with the Markdown heading `## Reasoning`.
    -   **Conclusion**: Start the final response content (within `plan_mode_respond` or `attempt_completion`) with the Markdown heading `## Final Answer` (or a descriptive equivalent like `## Plan`, `## Solution`).
-   **Goal**: This formatting allows the user to easily skim or skip the reasoning process and jump directly to the final actionable answer or plan.
