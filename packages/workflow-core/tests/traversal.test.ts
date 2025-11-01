/**
 * Tests for workflow traversal
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NodeBuilder, WorkflowBuilder } from "../src/builder.js";
import { TraversalOrder, WorkflowTraversal } from "../src/traversal.js";

describe("WorkflowTraversal", () => {
  it("should traverse workflow in depth-first order", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .connect("node1", "node2")
      .connect("node2", "node3")
      .build();

    const visited: string[] = [];
    WorkflowTraversal.traverse(
      workflow,
      "node1",
      (node) => {
        visited.push(node.id);
      },
      TraversalOrder.DEPTH_FIRST,
    );

    assert.deepEqual(visited, ["node1", "node2", "node3"]);
  });

  it("should traverse workflow in breadth-first order", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "action").build();
    const node4 = new NodeBuilder("node4", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .addNode(node4)
      .connect("node1", "node2")
      .connect("node1", "node3")
      .connect("node2", "node4")
      .build();

    const visited: string[] = [];
    WorkflowTraversal.traverse(
      workflow,
      "node1",
      (node) => {
        visited.push(node.id);
      },
      TraversalOrder.BREADTH_FIRST,
    );

    // BFS should visit node1, then its children (node2, node3), then node4
    assert.equal(visited[0], "node1");
    assert.ok(visited.slice(1, 3).includes("node2"));
    assert.ok(visited.slice(1, 3).includes("node3"));
    assert.equal(visited[3], "node4");
  });

  it("should support topological traversal", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .connect("node1", "node3")
      .connect("node2", "node3")
      .build();

    const visited: string[] = [];
    WorkflowTraversal.traverse(
      workflow,
      "node1",
      (node) => {
        visited.push(node.id);
      },
      TraversalOrder.TOPOLOGICAL,
    );

    // node1 and node2 should come before node3
    const node3Index = visited.indexOf("node3");
    assert.ok(node3Index > visited.indexOf("node1"));
    assert.ok(node3Index > visited.indexOf("node2"));
  });

  it("should stop traversal when visitor returns false", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .connect("node1", "node2")
      .connect("node2", "node3")
      .build();

    const visited: string[] = [];
    WorkflowTraversal.traverse(workflow, "node1", (node) => {
      visited.push(node.id);
      if (node.id === "node2") {
        return false; // Stop traversal
      }
    });

    assert.equal(visited.length, 2);
    assert.deepEqual(visited, ["node1", "node2"]);
  });

  it("should find root nodes", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "trigger").build();
    const node3 = new NodeBuilder("node3", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .connect("node1", "node3")
      .connect("node2", "node3")
      .build();

    const roots = WorkflowTraversal.findRootNodes(workflow);
    assert.equal(roots.length, 2);
    assert.ok(roots.some((n) => n.id === "node1"));
    assert.ok(roots.some((n) => n.id === "node2"));
  });

  it("should find leaf nodes", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "output").build();
    const node4 = new NodeBuilder("node4", "output").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .addNode(node4)
      .connect("node1", "node2")
      .connect("node2", "node3")
      .connect("node2", "node4")
      .build();

    const leaves = WorkflowTraversal.findLeafNodes(workflow);
    assert.equal(leaves.length, 2);
    assert.ok(leaves.some((n) => n.id === "node3"));
    assert.ok(leaves.some((n) => n.id === "node4"));
  });

  it("should get all descendants", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();
    const node3 = new NodeBuilder("node3", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .addNode(node1)
      .addNode(node2)
      .addNode(node3)
      .connect("node1", "node2")
      .connect("node2", "node3")
      .build();

    const descendants = WorkflowTraversal.getDescendants(workflow, "node1");
    assert.equal(descendants.length, 2);
    assert.ok(descendants.some((n) => n.id === "node2"));
    assert.ok(descendants.some((n) => n.id === "node3"));
  });
});
