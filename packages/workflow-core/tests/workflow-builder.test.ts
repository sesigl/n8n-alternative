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

  it("should connect two nodes", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const node1Id = builder.addNode({
      spec: { type: "http.request", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "response" }],
      },
    });

    const node2Id = builder.addNode({
      spec: { type: "llm.invoke", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "prompt" }],
        outputs: [],
      },
    });

    const workflow1 = builder.build();
    const outputPortId = workflow1.nodes[0]?.ports.outputs[0]?.id;
    const inputPortId = workflow1.nodes[1]?.ports.inputs[0]?.id;

    if (!outputPortId || !inputPortId) {
      throw new Error("Port IDs not found");
    }

    builder.connect({
      source: { nodeId: node1Id, portId: outputPortId },
      target: { nodeId: node2Id, portId: inputPortId },
    });

    const workflow = builder.build();

    expect(workflow.edges).toHaveLength(1);
    expect(workflow.edges[0]?.source.nodeId).toBe(node1Id);
    expect(workflow.edges[0]?.target.nodeId).toBe(node2Id);
  });

  it("should create multiple connections", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const node1Id = builder.addNode({
      spec: { type: "start", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    const node2Id = builder.addNode({
      spec: { type: "middle", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [{ name: "out" }],
      },
    });

    const node3Id = builder.addNode({
      spec: { type: "end", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [],
      },
    });

    const workflow1 = builder.build();
    const port1Out = workflow1.nodes[0]?.ports.outputs[0]?.id;
    const port2In = workflow1.nodes[1]?.ports.inputs[0]?.id;
    const port2Out = workflow1.nodes[1]?.ports.outputs[0]?.id;
    const port3In = workflow1.nodes[2]?.ports.inputs[0]?.id;

    if (!port1Out || !port2In || !port2Out || !port3In) {
      throw new Error("Port IDs not found");
    }

    builder.connect({
      source: { nodeId: node1Id, portId: port1Out },
      target: { nodeId: node2Id, portId: port2In },
    });

    builder.connect({
      source: { nodeId: node2Id, portId: port2Out },
      target: { nodeId: node3Id, portId: port3In },
    });

    const workflow = builder.build();

    expect(workflow.edges).toHaveLength(2);
  });

  it("should set single entrypoint", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeId = builder.addNode({
      spec: { type: "trigger", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    builder.setEntrypoints([nodeId]);

    const workflow = builder.build();

    expect(workflow.entrypoints).toHaveLength(1);
    expect(workflow.entrypoints[0]).toBe(nodeId);
  });

  it("should set multiple entrypoints", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const node1Id = builder.addNode({
      spec: { type: "trigger1", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    const node2Id = builder.addNode({
      spec: { type: "trigger2", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    builder.setEntrypoints([node1Id, node2Id]);

    const workflow = builder.build();

    expect(workflow.entrypoints).toHaveLength(2);
    expect(workflow.entrypoints).toContain(node1Id);
    expect(workflow.entrypoints).toContain(node2Id);
  });

  it("should replace entrypoints when set multiple times", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const node1Id = builder.addNode({
      spec: { type: "trigger1", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    const node2Id = builder.addNode({
      spec: { type: "trigger2", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    builder.setEntrypoints([node1Id]);
    builder.setEntrypoints([node2Id]);

    const workflow = builder.build();

    expect(workflow.entrypoints).toHaveLength(1);
    expect(workflow.entrypoints[0]).toBe(node2Id);
  });
});
