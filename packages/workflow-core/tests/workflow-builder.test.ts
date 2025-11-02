import { describe, expect, it } from "vitest";
import { WorkflowBuilder } from "../src/public/workflow-builder";

describe("WorkflowBuilder", () => {
  it("should create workflow with metadata", () => {
    const builder = WorkflowBuilder.init({
      name: "Test Workflow",
      version: "1.0",
    });

    const workflow = builder.build();

    expect(workflow.metadata.name).toBe("Test Workflow");
    expect(workflow.metadata.version).toBe("1.0");
    expect(workflow.metadata.createdAt).toBeDefined();
  });

  it("should create workflow with no nodes initially", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const workflow = builder.build();

    expect(workflow.nodes).toHaveLength(0);
  });

  it("should create workflow with no edges initially", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const workflow = builder.build();

    expect(workflow.edges).toHaveLength(0);
  });

  it("should create workflow with no entrypoints initially", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const workflow = builder.build();

    expect(workflow.entrypoints).toHaveLength(0);
  });

  it("should add node to workflow", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeId = builder.addNode({
      spec: { type: "llm.invoke", version: 1 },
      config: { model: "gpt-4" },
      ports: {
        inputs: [{ name: "prompt" }],
        outputs: [{ name: "result" }],
      },
    });

    const workflow = builder.build();

    expect(workflow.nodes).toHaveLength(1);
    expect(workflow.nodes[0]?.id).toBe(nodeId);
    expect(workflow.nodes[0]?.spec.type).toBe("llm.invoke");
    expect(workflow.nodes[0]?.config.model).toBe("gpt-4");
  });

  it("should generate unique IDs for ports", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    builder.addNode({
      spec: { type: "llm.invoke", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "prompt" }],
        outputs: [{ name: "result" }],
      },
    });

    const workflow = builder.build();
    const node = workflow.nodes[0];

    expect(node?.ports.inputs[0]?.id).toBeDefined();
    expect(node?.ports.outputs[0]?.id).toBeDefined();
  });

  it("should add multiple nodes to workflow", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    builder.addNode({
      spec: { type: "llm.invoke", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    builder.addNode({
      spec: { type: "http.request", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    const workflow = builder.build();

    expect(workflow.nodes).toHaveLength(2);
  });
});
