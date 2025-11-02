#!/usr/bin/env node
/**
 * Checks that all same-package imports use @ aliases instead of relative paths
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC_DIR = "src";
const errors: string[] = [];

function checkFile(filePath: string) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line?.match(/import\s+.*from\s+["'](\.[^"']+)["']/);

    if (match) {
      const importPath = match[1];
      errors.push(`${filePath}:${i + 1}: Relative import found: ${importPath}`);
      errors.push(`  → Use @/* alias instead`);
    }
  }
}

function walkDir(dir: string) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
      checkFile(filePath);
    }
  }
}

walkDir(SRC_DIR);

if (errors.length > 0) {
  console.error("❌ Found relative imports (use @/* aliases instead):\n");
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
}

console.log("✓ All imports use @/* aliases");
