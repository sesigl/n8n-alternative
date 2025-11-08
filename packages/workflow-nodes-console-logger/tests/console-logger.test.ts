import { beforeEach, describe, expect, it, vi } from "vitest";
import { consoleLoggerNode } from "../src/console-logger.js";

describe("Console Logger Node", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should define valid input and output types in schema", () => {
    expect(consoleLoggerNode.inputs.message).toBe("string");
    expect(consoleLoggerNode.outputs.logged).toBe("string");
  });

  it("should return outputs matching the defined types", async () => {
    const result = await consoleLoggerNode.execute({ message: "Test" });

    for (const [outputName, expectedType] of Object.entries(consoleLoggerNode.outputs)) {
      expect(result[outputName]).toBeDefined();
      expect(typeof result[outputName]).toBe(expectedType);
    }
  });

  it("should log message to console", async () => {
    await consoleLoggerNode.execute({ message: "Hello World" });

    expect(console.log).toHaveBeenCalledWith("Hello World");
  });

  it("should return the logged message", async () => {
    const result = await consoleLoggerNode.execute({ message: "Test message" });

    expect(result.logged).toBe("Test message");
  });

  it("should handle empty message", async () => {
    const result = await consoleLoggerNode.execute({ message: "" });

    expect(console.log).toHaveBeenCalledWith("");
    expect(result.logged).toBe("");
  });
});
