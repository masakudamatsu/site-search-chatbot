## Brief overview
Defines the mandatory lifecycle for every task to ensure context awareness, user oversight, and quality control. This replaces fragmented workflow rules.

## 1. Task Initialization
- **Memory Bank Check**: At the start of *every* new task, read the core Memory Bank files.

## 2. Planning Phase (Plan Mode)
- **Context Gathering**: Use tools to understand relevant files. (Refer to `05-information-gathering.md` for protocol).
- **Focus Chain**:
    - Create a hierarchical list of steps (Focus Chain).
    - Clearly mark the "Current Focus".

## 3. Drafting Phase (Plan Mode)
- **Code Drafting (Mandatory)**:
    - **Draft First**: Never start coding in Act Mode without a plan.
    - **Presentation**: Present the exact code or logic you intend to write. This allows the user to review or implement it themselves.
- **Transition Condition**: Do NOT request to switch to Act Mode until the user has approved the Code Draft.

## 4. Execution Phase (Act Mode)
- **Implementation**: Execute the approved draft.
- **Progress Tracking**: Maintain a checklist using the `task_progress` tool parameter (updates are silent/system-level).
- **Step Completion & Commits**:
    - After successfully completing a step (and verifying it), proactively suggest a git commit message.
    - The commit message will follow this structure:
      - Format: Conventional Commits (e.g., `feat(scope): description`).
      - **Subject Line (What):** The subject line should concisely describe *what* was done.
      - **Body (Why):** The body should explain *why* the change was made, followed by any additional implementation details.
    - Wait for confirmation before proceeding to the next step in the Focus Chain.
- **Update the Focus Chain**: Present the focus chain and mark the "Current Focus" on the next step before starting to draft code.

## 4. Task Completion
- **Final Output**: Use `attempt_completion` only when all steps are verified.
- **Update Confirmation**: Before summarizing context or starting work, explicitly ask: "Should I update the Memory Bank with recent progress first?"
