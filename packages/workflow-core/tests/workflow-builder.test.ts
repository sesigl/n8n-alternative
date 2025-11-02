import { describe, expect, it } from "vitest";
import type { UUID } from "../src/public/types/uuid";
import { WorkflowBuilder } from "../src/public/workflow-builder";
import { GraphStructureAsserter } from "./graph-structure-asserter";

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

  it("should create empty workflow successfully", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    expect(() => builder.build()).not.toThrow();
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

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasNodeCount(1)
      .hasNodeWithType(nodeId, "llm.invoke");
  });

  it("should add node with ports successfully", () => {
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

    expect(() => builder.build()).not.toThrow();
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

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasNodeCount(2);
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

    builder.connect({
      source: { nodeId: node1Id, portName: "response" },
      target: { nodeId: node2Id, portName: "prompt" },
    });

    const workflow = builder.build();

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasEdgeCount(1)
      .hasEdge(node1Id, node2Id);
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

    builder.connect({
      source: { nodeId: node1Id, portName: "out" },
      target: { nodeId: node2Id, portName: "in" },
    });

    builder.connect({
      source: { nodeId: node2Id, portName: "out" },
      target: { nodeId: node3Id, portName: "in" },
    });

    const workflow = builder.build();

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasEdgeCount(2);
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

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasEntrypointCount(1)
      .hasEntrypoint(nodeId);
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

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasEntrypoints([node1Id, node2Id]);
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

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasEntrypointCount(1)
      .hasEntrypoint(node2Id);
  });

  it("should build workflow with linear chain of nodes", () => {
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

    builder.connect({
      source: { nodeId: node1Id, portName: "out" },
      target: { nodeId: node2Id, portName: "in" },
    });

    builder.connect({
      source: { nodeId: node2Id, portName: "out" },
      target: { nodeId: node3Id, portName: "in" },
    });

    builder.setEntrypoints([node1Id]);

    const workflow = builder.build();

    GraphStructureAsserter.from(workflow.getGraphStructure())
      .hasNodeCount(3)
      .hasEdgeCount(2)
      .hasEntrypoint(node1Id);
  });

  it("should build workflow with branching structure", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const startId = builder.addNode({
      spec: { type: "start", version: 1 },
      config: {},
      ports: {
        inputs: [],
        outputs: [{ name: "out" }],
      },
    });

    const branchAId = builder.addNode({
      spec: { type: "branch-a", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [],
      },
    });

    const branchBId = builder.addNode({
      spec: { type: "branch-b", version: 1 },
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

    const workflow = builder.build();

    GraphStructureAsserter.from(workflow.getGraphStructure()).hasNodeCount(3).hasEdgeCount(2);
  });

  it("should reject workflow with cycle when validation enabled", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const node1Id = builder.addNode({
      spec: { type: "node1", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [{ name: "out" }],
      },
    });

    const node2Id = builder.addNode({
      spec: { type: "node2", version: 1 },
      config: {},
      ports: {
        inputs: [{ name: "in" }],
        outputs: [{ name: "out" }],
      },
    });

    builder.connect({
      source: { nodeId: node1Id, portName: "out" },
      target: { nodeId: node2Id, portName: "in" },
    });

    builder.connect({
      source: { nodeId: node2Id, portName: "out" },
      target: { nodeId: node1Id, portName: "in" },
    });

    builder.setEntrypoints([node1Id]);

    expect(() => builder.build()).toThrow();
  });

  it("should reject workflow with entrypoint referencing non-existent node", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    builder.addNode({
      spec: { type: "test", version: 1 },
      config: {},
      ports: { inputs: [], outputs: [] },
    });

    builder.setEntrypoints(["non-existent-id" as UUID]);

    expect(() => builder.build()).toThrow();
  });

  it("should reject connection with non-existent source node", () => {
    const builder = WorkflowBuilder.init({
      name: "Test",
      version: "1.0",
    });

    const nodeId = builder.addNode({
      spec: { type: "test", version: 1 },
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
      spec: { type: "test", version: 1 },
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
