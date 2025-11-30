import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["tests/vitest/**/*.spec.ts"],
    globals: true, // Use Jest-like globals (describe, test, expect)
    environment: "jsdom", // Simulate a browser environment if needed for some tests
    setupFiles: "./tests/vitest/setup.ts", // Load environment variables from .env.local
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
