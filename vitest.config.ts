import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use glob patterns to define projects - only match directories with vitest configs
    projects: [
      "packages/workflow-core",
      "packages/workflow-registry",
      "packages/workflow-executor",
      "packages/workflow-nodes/console-logger",
      "packages/workflow-nodes/trigger-execution",
    ],
  },
});
