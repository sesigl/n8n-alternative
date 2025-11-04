import { NodeRegistry } from "@workflow/registry";
import { describe, expect, it } from "vitest";
import type { UUID } from "../src/public/types/uuid";
import { WorkflowBuilder } from "../src/public/workflow-builder";
import { GraphStructureAsserter } from "./graph-structure-asserter";

function registerTestNodeType(registry: NodeRegistry, type: string, version: number) {
  const fullType = type.includes(".") ? type : `test.${type}`;
  registry.registerNode({
    type: `${fullType}@${version}`,
    metadata: { name: type, description: "Test node" },
    inputs: {},
    outputs: {},
    execute: async () => ({}),
  });
}

describe("WorkflowBuilder", () => {
  it("should create workflow with metadata", () => {
    const registry = new NodeRegistry();
    const builder = WorkflowBuilder.init({
      name: "Test Workflow",
      version: "1.0",
    });

    const workflow = builder.build(registry);

    expect(workflow.metadata.name).toBe("Test Workflow");
    expect(workflow.metadata.version).toBe("1.0");
    expect(workflow.metadata.createdAt).toBeDefined();
  });

  it("should create empty workflow successfully", () => {
    const registry = new NodeRegistry();
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    expect(() => builder.build(registry)).not.toThrow();
  });

  it("should add node to workflow", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "llm.invoke", 1);

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

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasNodeCount(1)
      .hasNodeWithType(nodeId, "llm.invoke");
  });

  it("should add node with ports successfully", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "llm.invoke", 1);

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

    expect(() => builder.build(registry)).not.toThrow();
  });

  it("should add multiple nodes to workflow", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "llm.invoke", 1);
    registerTestNodeType(registry, "http.request", 1);

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

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasNodeCount(2);
  });

  it("should connect two nodes", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "http.request", 1);
    registerTestNodeType(registry, "llm.invoke", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeoneId = builder.addNode({
      spec: { type: "http.request", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "response" }],
      },
    });

    const nodetwoId = builder.addNode({
      spec: { type: "llm.invoke", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "prompt" }],
        outputs: [],
      },
    });

    builder.connect({
      source: { nodeId: nodeoneId, portName: "response" },
      target: { nodeId: nodetwoId, portName: "prompt" },
    });

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasEdgeCount(1)
      .hasEdge(nodeoneId, nodetwoId);
  });

  it("should create multiple connections", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "start", 1);
    registerTestNodeType(registry, "middle", 1);
    registerTestNodeType(registry, "end", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeoneId = builder.addNode({
      spec: { type: "test.start", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    const nodetwoId = builder.addNode({
      spec: { type: "test.middle", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [{ name: "out" }],
      },
    });

    const node3Id = builder.addNode({
      spec: { type: "test.end", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [],
      },
    });

    builder.connect({
      source: { nodeId: nodeoneId, portName: "out" },
      target: { nodeId: nodetwoId, portName: "in" },
    });

    builder.connect({
      source: { nodeId: nodetwoId, portName: "out" },
      target: { nodeId: node3Id, portName: "in" },
    });

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasEdgeCount(2);
  });

  it("should set single entrypoint", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "trigger", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeId = builder.addNode({
      spec: { type: "test.trigger", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    builder.setEntrypoints([nodeId]);

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasEntrypointCount(1)
      .hasEntrypoint(nodeId);
  });

  it("should set multiple entrypoints", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "triggerone", 1);
    registerTestNodeType(registry, "triggertwo", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeoneId = builder.addNode({
      spec: { type: "test.triggerone", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    const nodetwoId = builder.addNode({
      spec: { type: "test.triggertwo", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    builder.setEntrypoints([nodeoneId, nodetwoId]);

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasEntrypoints([
      nodeoneId,
      nodetwoId,
    ]);
  });

  it("should replace entrypoints when set multiple times", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "triggerone", 1);
    registerTestNodeType(registry, "triggertwo", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeoneId = builder.addNode({
      spec: { type: "test.triggerone", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    const nodetwoId = builder.addNode({
      spec: { type: "test.triggertwo", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    builder.setEntrypoints([nodeoneId]);
    builder.setEntrypoints([nodetwoId]);

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasEntrypointCount(1)
      .hasEntrypoint(nodetwoId);
  });

  it("should build workflow with linear chain of nodes", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "start", 1);
    registerTestNodeType(registry, "middle", 1);
    registerTestNodeType(registry, "end", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeoneId = builder.addNode({
      spec: { type: "test.start", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    const nodetwoId = builder.addNode({
      spec: { type: "test.middle", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [{ name: "out" }],
      },
    });

    const node3Id = builder.addNode({
      spec: { type: "test.end", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [],
      },
    });

    builder.connect({
      source: { nodeId: nodeoneId, portName: "out" },
      target: { nodeId: nodetwoId, portName: "in" },
    });

    builder.connect({
      source: { nodeId: nodetwoId, portName: "out" },
      target: { nodeId: node3Id, portName: "in" },
    });

    builder.setEntrypoints([nodeoneId]);

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasNodeCount(3)
      .hasEdgeCount(2)
      .hasEntrypoint(nodeoneId);
  });

  it("should build workflow with branching structure", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "start", 1);
    registerTestNodeType(registry, "brancha", 1);
    registerTestNodeType(registry, "branchb", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const startId = builder.addNode({
      spec: { type: "test.start", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    const branchAId = builder.addNode({
      spec: { type: "test.brancha", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [],
      },
    });

    const branchBId = builder.addNode({
      spec: { type: "test.branchb", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [],
      },
    });

    builder.connect({
      source: { nodeId: startId, portName: "out" },
      target: { nodeId: branchAId, portName: "in" },
    });

    builder.connect({
      source: { nodeId: startId, portName: "out" },
      target: { nodeId: branchBId, portName: "in" },
    });

    builder.setEntrypoints([startId]);

    const workflow = builder.build(registry);

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasNodeCount(3).hasEdgeCount(2);
  });

  it("should reject workflow with cycle when validation enabled", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "nodeone", 1);
    registerTestNodeType(registry, "nodetwo", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeoneId = builder.addNode({
      spec: { type: "test.nodeone", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [{ name: "out" }],
      },
    });

    const nodetwoId = builder.addNode({
      spec: { type: "test.nodetwo", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [{ name: "out" }],
      },
    });

    builder.connect({
      source: { nodeId: nodeoneId, portName: "out" },
      target: { nodeId: nodetwoId, portName: "in" },
    });

    builder.connect({
      source: { nodeId: nodetwoId, portName: "out" },
      target: { nodeId: nodeoneId, portName: "in" },
    });

    builder.setEntrypoints([nodeoneId]);

    expect(() => builder.build(registry)).toThrow();
  });

  it("should reject workflow with entrypoint referencing non-existent node", () => {
    const registry = new NodeRegistry();
    registerTestNodeType(registry, "test", 1);

    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    builder.addNode({
      spec: { type: "test.test", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    builder.setEntrypoints(["non-existent-id" as UUID]);

    expect(() => builder.build(registry)).toThrow();
  });

  it("should reject connection with non-existent source node", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeId = builder.addNode({
      spec: { type: "test.test", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [],
      },
    });

    expect(() => {
      builder.connect({
        source: { nodeId: "non-existent" as UUID, portName: "out" },
        target: { nodeId, portName: "in" },
      });
    }).toThrow("Source node not found");
  });

  it("should reject connection with non-existent target node", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeId = builder.addNode({
      spec: { type: "test.test", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    expect(() => {
      builder.connect({
        source: { nodeId, portName: "out" },
        target: { nodeId: "non-existent" as UUID, portName: "in" },
      });
    }).toThrow("Target node not found");
  });
});
