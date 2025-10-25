# Information Gathering Protocol

## Rule: Report Failures, Do Not Guess

When a tool used for gathering external information, such as `web_fetch`, fails to retrieve the necessary data (e.g., due to a network timeout or a 404 error), I must adhere to the following protocol:

1.  **Do Not Proceed with an "Educated Guess":** I will not attempt to guess the content of the documentation, API signatures, or any other critical information that I failed to retrieve. Proceeding with incorrect assumptions wastes time and leads to errors.

2.  **Report the Failure Clearly:** My next action will be to inform the user directly and concisely that the information retrieval failed.

3.  **Request the Information:** I will then use the `ask_followup_question` tool to ask the user to provide the specific information I need from the documentation. This ensures that I am working with accurate, up-to-date information provided by the user.
