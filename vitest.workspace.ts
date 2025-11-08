import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";
import { defineWorkspace } from "vitest/config";

/**
 * Automatically discover and configure Vitest projects from pnpm workspace.
 *
 * This reads pnpm-workspace.yaml and converts the glob patterns into actual
 * package directories. When you add a new package to the workspace, it will
 * automatically be picked up for testing - no vitest config changes needed!
 */

// Read pnpm-workspace.yaml to get all workspace patterns
const workspaceYaml = readFileSync("pnpm-workspace.yaml", "utf-8");
const workspaceConfig = load(workspaceYaml) as { packages: string[] };

// Convert glob patterns to actual package directories
function getPackageDirectories(patterns: string[]): string[] {
  const directories: string[] = [];

  for (const pattern of patterns) {
    // Handle simple patterns like "packages/*" and "packages/workflow-nodes/*"
    if (pattern.endsWith("/*")) {
      const baseDir = pattern.slice(0, -2);
      try {
        const entries = readdirSync(baseDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name !== "node_modules") {
            directories.push(join(baseDir, entry.name));
          }
        }
      } catch {
        // Directory doesn't exist, skip
      }
    } else {
      // For other patterns, add as-is
      directories.push(pattern);
    }
  }

  return directories;
}

// Get all package directories
const packageDirs = getPackageDirectories(workspaceConfig.packages);

// Create workspace config for each package
export default defineWorkspace(
  packageDirs.map((dir) => ({
    extends: "./vitest.config.ts",
    test: {
      name: dir.replace(/^.*\//, ""), // Use last part of path as name
      root: dir,
    },
  })),
);
