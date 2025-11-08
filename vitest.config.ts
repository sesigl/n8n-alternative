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
    // Auto-discover packages using glob patterns from workspace structure
    projects: [
      "packages/{workflow-core,workflow-executor,workflow-registry}", // Direct packages
      "packages/workflow-nodes/*", // Nested packages
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["node_modules/**", "dist/**", "**/*.d.ts", "**/*.config.*", "**/tests/**"],
    },
  },
});
