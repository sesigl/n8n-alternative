import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use glob patterns to define projects - only match directories with vitest configs
    projects: ["packages/**/vitest.config.ts"],
  },
});
