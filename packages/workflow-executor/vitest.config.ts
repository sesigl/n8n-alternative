import path from "node:path";
import { defineBaseConfig } from "../vitest.config.shared";
import { mergeConfig } from "vitest/config";

export default mergeConfig(defineBaseConfig(__dirname), {
  resolve: {
    alias: {
      // Resolve workspace packages to source files
      "@workflow/core": path.resolve(__dirname, "../workflow-core/src/public/index.ts"),
      "@workflow/registry": path.resolve(__dirname, "../workflow-registry/src/public/index.ts"),
      // Resolve @ paths for imported packages
      "@/": new URL("../workflow-core/src/", import.meta.url).pathname,
    },
  },
});
