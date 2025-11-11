import { describe, expect, it } from "vitest";
import { triggerExecutionNode } from "../src/trigger-execution.js";

describe("Trigger Execution Node", () => {
  it("should execute and return executionStarted timestamp", async () => {
    const result = await triggerExecutionNode.execute({});

    expect(result.executionStarted).toBeDefined();
    expect(typeof result.executionStarted).toBe("string");
    expect(Number.parseInt(result.executionStarted as string, 10)).toBeGreaterThan(0);
  });

  it("should return current timestamp", async () => {
    const beforeExecution = Date.now();
    const result = await triggerExecutionNode.execute({});
    const afterExecution = Date.now();

    const timestamp = Number.parseInt(result.executionStarted as string, 10);
    expect(timestamp).toBeGreaterThanOrEqual(beforeExecution);
    expect(timestamp).toBeLessThanOrEqual(afterExecution);
  });
});
