import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    conditions: ["development", "default"],
  },
  test: {
    globals: true,
    environment: "node",
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/dist/**"],
    projects: [
      {
        test: {
          name: "workflow-registry",
          root: "./packages/workflow-registry",
        },
      },
      {
        test: {
          name: "workflow-core",
          root: "./packages/workflow-core",
        },
      },
      {
        test: {
          name: "workflow-executor",
          root: "./packages/workflow-executor",
        },
      },
      {
        test: {
          name: "console-logger",
          root: "./packages/workflow-nodes/console-logger",
        },
      },
      {
        test: {
          name: "trigger-execution",
          root: "./packages/workflow-nodes/trigger-execution",
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["node_modules/**", "dist/**", "**/*.d.ts", "**/*.config.*", "**/tests/**"],
    },
  },
});
