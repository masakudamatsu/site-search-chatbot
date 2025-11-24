## Brief overview
This file establishes project-wide coding standards for imports and testing patterns to ensure consistency and maintainability.

## Import Path Convention
-   **Always use absolute `@`-aliased paths**: For any imports referencing modules inside the `src` directory, use the `@/` prefix. This avoids relative paths (e.g., `../../`) and improves readability and maintainability.
-   **Correct Usage**:
    ```typescript
    import { supabase } from '@/lib/supabase';
    ```
-   **Incorrect Usage**:
    ```typescript
    import { supabase } from '../../src/lib/supabase';
    ```

## Test Code Guidelines
-   **Use Dynamic Assertions**: Avoid hardcoded values in test assertions whenever possible. Instead, assert against the input data or variables derived from it. This makes tests more robust to changes in the test data.
    -   *Bad:* `expect(result.content).toBe('Hello world');`
    -   *Good:* `expect(result.content).toBe(inputData.content);`
