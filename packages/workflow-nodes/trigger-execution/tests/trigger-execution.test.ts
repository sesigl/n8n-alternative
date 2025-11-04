import { describe, expect, it } from "vitest";
import { triggerExecutionNode } from "@/trigger-execution.js";

describe("Trigger Execution Node", () => {
  it("should define valid output types in schema", () => {
    expect(triggerExecutionNode.outputs.executionStarted).toBe("number");
  });

  it("should return outputs matching the defined types", async () => {
    const result = await triggerExecutionNode.execute({});

    for (const [outputName, _expectedType] of Object.entries(triggerExecutionNode.outputs)) {
      expect(result[outputName]).toBeDefined();
      expect(typeof result[outputName]).toBe("string");
    }
  });

  it("should execute and return executionStarted timestamp", async () => {
    const result = await triggerExecutionNode.execute({});

    expect(result.executionStarted).toBeDefined();
    expect(typeof result.executionStarted).toBe("string");
    expect(Number.parseInt(result.executionStarted as string, 10)).toBeGreaterThan(0);
  });

  it("should generate unique timestamp on each execution", async () => {
    const result1 = await triggerExecutionNode.execute({});
    await new Promise((resolve) => setTimeout(resolve, 1));
    const result2 = await triggerExecutionNode.execute({});

    expect(result1.executionStarted).not.toBe(result2.executionStarted);
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
