import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export const sharedConfig = defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    conditions: ["development", "default"],
  },
  test: {
    globals: true,
    environment: "node",
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["node_modules/**", "dist/**", "**/*.d.ts", "**/*.config.*", "**/tests/**"],
    },
  },
});
