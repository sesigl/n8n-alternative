/**
 * Tests for workflow builder
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NodeBuilder, WorkflowBuilder } from "../src/builder.js";

describe("NodeBuilder", () => {
  it("should build a simple node", () => {
    const node = new NodeBuilder("node1", "http")
      .name("HTTP Request")
      .parameter("url", "https://api.example.com")
      .position(100, 200)
      .build();

    assert.equal(node.id, "node1");
    assert.equal(node.type, "http");
    assert.equal(node.name, "HTTP Request");
    assert.deepEqual(node.parameters, { url: "https://api.example.com" });
    assert.deepEqual(node.position, { x: 100, y: 200 });
  });

  it("should build a node with multiple parameters", () => {
    const node = new NodeBuilder("node2", "database")
      .parameters({
        host: "localhost",
        port: 5432,
        database: "mydb",
      })
      .build();

    assert.equal(node.id, "node2");
    assert.deepEqual(node.parameters, {
      host: "localhost",
      port: 5432,
      database: "mydb",
    });
  });

  it("should throw error if building incomplete node", () => {
    const builder = new NodeBuilder("", "");
    assert.throws(() => builder.build(), /Node must have id, type, and name/);
  });
});

describe("WorkflowBuilder", () => {
  it("should build a simple workflow", () => {
    const workflow = WorkflowBuilder.create("wf1", "My Workflow")
      .description("A simple workflow")
      .build();

    assert.equal(workflow.id, "wf1");
    assert.equal(workflow.name, "My Workflow");
    assert.equal(workflow.description, "A simple workflow");
    assert.equal(workflow.nodes.length, 0);
    assert.equal(workflow.connections.length, 0);
  });

  it("should build a workflow with nodes", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "My Workflow")
      .addNode(node1)
      .addNode(node2)
      .build();

    assert.equal(workflow.nodes.length, 2);
    assert.equal(workflow.nodes[0].id, "node1");
    assert.equal(workflow.nodes[1].id, "node2");
  });

  it("should build a workflow with connections", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const node2 = new NodeBuilder("node2", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "My Workflow")
      .addNode(node1)
      .addNode(node2)
      .connect("node1", "node2")
      .build();

    assert.equal(workflow.connections.length, 1);
    assert.equal(workflow.connections[0].sourceNodeId, "node1");
    assert.equal(workflow.connections[0].targetNodeId, "node2");
  });

  it("should throw error when adding duplicate node", () => {
    const builder = WorkflowBuilder.create("wf1", "My Workflow");
    const node = new NodeBuilder("node1", "trigger").build();

    builder.addNode(node);
    assert.throws(() => builder.addNode(node), /already exists/);
  });

  it("should throw error when connecting non-existent nodes", () => {
    const builder = WorkflowBuilder.create("wf1", "My Workflow");
    assert.throws(() => builder.connect("node1", "node2"), /not found/);
  });

  it("should support fluent node building", () => {
    const builder = WorkflowBuilder.create("wf1", "My Workflow");

    builder
      .node("node1", "http")
      .name("HTTP Request")
      .parameter("url", "https://api.example.com")
      .build();

    const workflow = builder.build();
    assert.equal(workflow.nodes.length, 1);
    assert.equal(workflow.nodes[0].id, "node1");
    assert.equal(workflow.nodes[0].name, "HTTP Request");
  });
});
