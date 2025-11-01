/**
 * Tests for workflow validator
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NodeBuilder, WorkflowBuilder } from "../src/builder.js";
import { ValidationErrorType } from "../src/types.js";
import { WorkflowValidator } from "../src/validator.js";

describe("WorkflowValidator", () => {
  it("should validate a valid workflow", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "My Workflow")
      .addNode(node1)
      .addNode(node2)
      .connect("node1", "node2")
      .build();

    const result = WorkflowValidator.validate(workflow);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it("should detect duplicate node IDs", () => {
    const workflow = {
      id: "wf1",
      name: "Test",
      nodes: [
        { id: "node1", type: "trigger", name: "Node 1", parameters: {} },
        { id: "node1", type: "action", name: "Node 2", parameters: {} },
      ],
      connections: [],
    };

    const result = WorkflowValidator.validate(workflow);
    assert.equal(result.valid, false);
    assert.equal(
      result.errors.some((e) => e.type === ValidationErrorType.DUPLICATE_NODE_ID),
      true,
    );
  });

  it("should detect invalid connections", () => {
    const workflow = {
      id: "wf1",
      name: "Test",
      nodes: [{ id: "node1", type: "trigger", name: "Node 1", parameters: {} }],
      connections: [
        {
          id: "conn1",
          sourceNodeId: "node1",
          targetNodeId: "non-existent",
        },
      ],
    };

    const result = WorkflowValidator.validate(workflow);
    assert.equal(result.valid, false);
    assert.equal(
      result.errors.some((e) => e.type === ValidationErrorType.MISSING_NODE),
      true,
    );
  });

  it("should detect cycles", () => {
    const node1 = new NodeBuilder("node1", "action").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .connect("node1", "node2")
      .connect("node2", "node3")
      .connect("node3", "node1") // Creates a cycle
      .build();

    const result = WorkflowValidator.validate(workflow);
    assert.equal(result.valid, false);
    assert.equal(
      result.errors.some((e) => e.type === ValidationErrorType.CYCLE_DETECTED),
      true,
    );
  });

  it("should detect orphaned nodes", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3) // This node is orphaned
      .connect("node1", "node2")
      .build();

    const result = WorkflowValidator.validate(workflow);
    assert.equal(result.valid, false);
    assert.equal(
      result.errors.some(
        (e) => e.type === ValidationErrorType.ORPHANED_NODE && e.nodeId === "node3",
      ),
      true,
    );
  });

  it("should not flag orphaned nodes when only one node exists", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();

    const workflow = WorkflowBuilder.create("wf1", "Test").addNode(node1).build();

    const result = WorkflowValidator.validate(workflow);
    assert.equal(result.valid, true);
  });
});
