import path from "node:path";
import { defineConfig, type UserConfig } from "vitest/config";

export function defineBaseConfig(dirname: string): UserConfig {
  return defineConfig({
    test: {
      globals: true,
      environment: "node",
      passWithNoTests: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(dirname, "./src"),
      },
    },
  });
}
