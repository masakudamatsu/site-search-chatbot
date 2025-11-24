## Brief overview
This project-specific guideline ensures consistent import path styling throughout the codebase, leveraging the configured `tsconfig.json` path aliases.

## Import Path Convention
-   **Always use absolute `@`-aliased paths**: For any imports referencing modules inside the `src` directory, use the `@/` prefix. This avoids relative paths (`../`) and improves readability and maintainability.
-   **Correct Usage**:
    ```typescript
    import { supabase } from '@/lib/supabase';
    ```
-   **Incorrect Usage**:
    ```typescript
    import { supabase } from '../../src/lib/supabase';
