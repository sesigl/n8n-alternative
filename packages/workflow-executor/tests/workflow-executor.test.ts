import { WorkflowBuilder } from "@workflow/core";
import { NodeRegistry } from "@workflow/registry";
import { describe, expect, it } from "vitest";
import { WorkflowExecutor } from "../src/public/workflow-executor.js";

describe("WorkflowExecutor", () => {
  it("should accept and validate WorkflowDefinition", () => {
    const registry = new NodeRegistry();
    const workflow = WorkflowBuilder.init({
      name: "Simple Workflow",
      version: "1.0",
    }).build(registry);

    const executor = new WorkflowExecutor(registry);

    expect(() => executor.execute(workflow)).not.toThrow();
  });

  it("should fail when node type is missing from registry", () => {
    const registry = new NodeRegistry();

    const builder = WorkflowBuilder.init({
      name: "Test Workflow",
      version: "1.0",
    });

    builder.addNode({
      spec: { type: "unknown.node", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    expect(() => builder.build(registry)).toThrow("Node type not found");
  });

  it("should execute single node workflow", async () => {
    const registry = new NodeRegistry();

    registry.registerNode({
      type: "trigger.test",
      version: 1,
      metadata: { name: "Test Trigger", description: "Test trigger node" },
      inputs: {},
      outputs: { result: "string" },
      execute: async () => ({ result: "executed" }),
    });

    const builder = WorkflowBuilder.init({
      name: "Single Node",
      version: "1.0",
    });

    builder.addNode({
      spec: { type: "trigger.test", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [{ name: "result" }] },
    });

    const workflow = builder.build(registry);

    const executor = new WorkflowExecutor(registry);
    const result = await executor.execute(workflow);

    expect(result.status).toBe("completed");
  });

  it("should return node output for single node workflow", async () => {
    const registry = new NodeRegistry();

    registry.registerNode({
      type: "math.add",
      version: 1,
      metadata: { name: "Add", description: "Adds a value" },
      inputs: { value: "number" },
      outputs: { result: "number" },
      // biome-ignore lint/suspicious/useAwait: NodeDefinition requires async execute
      execute: async (inputs: Record<string, string>) => {
        const value = Number.parseInt(inputs.value || "0", 10);
        return { result: (value + 1).toString() };
      },
    });

    const builder = WorkflowBuilder.init({
      name: "Single Node Math",
      version: "1.0",
    });

    const nodeId = builder.addNode({
      spec: { type: "math.add", version: 1 },
      config: { value: 0 },
      ports: { inputs: [{ name: "value" }], outputs: [{ name: "result" }] },
    });

    builder.setEntrypoints([nodeId]);

    const workflow = builder.build(registry);
    const executor = new WorkflowExecutor(registry);
    const result = await executor.execute(workflow);

    expect(result.status).toBe("completed");
    expect(result.outputs).toBeDefined();
    expect(result.outputs?.result).toBe("1");
  });

  it("should execute multi-node workflow with data flow", async () => {
    const registry = new NodeRegistry();

    registry.registerNode({
      type: "math.add",
      version: 1,
      metadata: { name: "Add", description: "Adds a value" },
      inputs: { value: "number" },
      outputs: { result: "number" },
      // biome-ignore lint/suspicious/useAwait: NodeDefinition requires async execute
      execute: async (inputs: Record<string, string>) => {
        const value = Number.parseInt(inputs.value || "0", 10);
        const addValue = Number.parseInt(inputs.addValue || "1", 10);
        return { result: (value + addValue).toString() };
      },
    });

    const builder = WorkflowBuilder.init({
      name: "Multi Node Math",
      version: "1.0",
    });

    const node1Id = builder.addNode({
      spec: { type: "math.add", version: 1 },
      config: { value: 0, addValue: 1 },
      ports: { inputs: [{ name: "value" }], outputs: [{ name: "result" }] },
    });

    const node2Id = builder.addNode({
      spec: { type: "math.add", version: 1 },
      config: { addValue: 2 },
      ports: { inputs: [{ name: "value" }], outputs: [{ name: "result" }] },
    });

    builder.setEntrypoints([node1Id]);
    builder.connect({
      source: { nodeId: node1Id, portName: "result" },
      target: { nodeId: node2Id, portName: "value" },
    });

    const workflow = builder.build(registry);
    const executor = new WorkflowExecutor(registry);
    const result = await executor.execute(workflow);

    expect(result.status).toBe("completed");
    expect(result.outputs).toBeDefined();
    expect(result.outputs?.result).toBe("3");
  });
});
