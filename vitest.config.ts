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
    // Auto-discover workspace packages for testing
    // - Nested packages (packages/workflow-nodes/*) are fully automatic
    // - Root packages need to be added to the brace expansion list once
    // This is necessary because packages/* would match non-packages (tsconfig.base.json, workflow-nodes dir)
    projects: [
      "packages/{workflow-core,workflow-executor,workflow-registry}",
      "packages/workflow-nodes/*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["node_modules/**", "dist/**", "**/*.d.ts", "**/*.config.*", "**/tests/**"],
    },
  },
});
