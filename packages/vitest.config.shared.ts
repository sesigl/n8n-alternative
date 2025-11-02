import path from "node:path";
import { defineConfig, type UserConfig } from "vitest/config";

export function defineBaseConfig(dirname: string): UserConfig {
  return defineConfig({
    test: {
      globals: true,
      environment: "node",
      passWithNoTests: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        reportsDirectory: "./coverage",
        exclude: ["node_modules/**", "dist/**", "**/*.d.ts", "**/*.config.*", "**/tests/**"],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(dirname, "./src"),
      },
    },
  });
}
