import { WorkflowBuilder } from "@workflow/core";
import { NodeRegistry } from "@workflow/registry";
import { describe, expect, it } from "vitest";
import { WorkflowExecutor } from "@/public/workflow-executor";

describe("WorkflowExecutor", () => {
  it("should accept and validate WorkflowDefinition", () => {
    const workflow = WorkflowBuilder.init({
      name: "Simple Workflow",
      version: "1.0",
    }).build();

    const registry = new NodeRegistry();
    const executor = new WorkflowExecutor(registry);

    expect(() => executor.execute(workflow)).not.toThrow();
  });

  it("should fail when node type is missing from registry", async () => {
    const registry = new NodeRegistry();

    const builder = WorkflowBuilder.init({
      name: "Test Workflow",
      version: "1.0",
    })

    builder.addNode({
        spec: { type: "unknown.node", version: 1 },
        config: {},
        ports: { inputs: [], outputs: [] },
      })
    const workflow = builder.build();

    const executor = new WorkflowExecutor(registry);

    await expect(executor.execute(workflow)).rejects.toThrow("Node type not found");
  });

  it("should execute single node workflow", async () => {
    const registry = new NodeRegistry();

    registry.registerNode({
      type: "trigger.test@1",
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

    const workflow = builder.build();

    const executor = new WorkflowExecutor(registry);
    const result = await executor.execute(workflow);

    expect(result.status).toBe("completed");
  });
});
