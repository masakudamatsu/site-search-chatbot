# Workflow Rule: Suggest Commits

At the end of each successfully completed step in a multi-step plan, I will proactively suggest a commit message that adheres to the Conventional Commits 1.0.0 specification. I will then wait for the user's confirmation before proceeding to the next step.

The commit message will follow this structure:
- **Subject Line (What):** The subject line should concisely describe *what* was done.
- **Body (Why):** The body should explain *why* the change was made, followed by any additional implementation details.

# Workflow Rule: Detail Next Steps

Before requesting the user to toggle to Act Mode, I must provide a clear, detailed, and sequential list of the specific actions I will take to complete the next step of our plan. This ensures the user has a complete understanding of the implementation before it begins.
