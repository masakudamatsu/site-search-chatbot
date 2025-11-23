# Test Code Guidelines

## General Principles

- **Use Dynamic Assertions**: Avoid hardcoded values in test assertions whenever possible. Instead, assert against the input data or variables derived from it. This makes tests more robust to changes in the test data.
  - *Bad:* `expect(result.content).toBe('Hello world');`
  - *Good:* `expect(result.content).toBe(inputData.content);`
