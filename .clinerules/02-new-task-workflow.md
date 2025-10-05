# New Task Workflow

## Pre-Task Summary Check

Before using the `<new_task>` tool to summarize the current work and start a new task, I must follow this procedure:

1.  **Confirm Memory Bank Status:** I will ask the user a direct question, such as: "Before we start a new task, should I first update the memory bank with our latest progress?"
2.  **Await User Confirmation:** I will not proceed with the `<new_task>` tool until the user has confirmed one of the following:
    *   Yes, the memory bank should be updated. (I will then perform the update).
    *   No, the memory bank is already up-to-date. (I can then proceed with the summary).

This rule ensures that the memory bank is never left outdated before a context reset, addressing the risk of forgetting to update it manually.
