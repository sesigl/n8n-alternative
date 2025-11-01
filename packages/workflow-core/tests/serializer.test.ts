/**
 * Tests for workflow serializer
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NodeBuilder, WorkflowBuilder } from "../src/builder.js";
import { WorkflowSerializer } from "../src/serializer.js";

describe("WorkflowSerializer", () => {
  it("should serialize workflow to JSON", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const workflow = WorkflowBuilder.create("wf1", "Test Workflow")
      .description("A test workflow")
      .addNode(node1)
      .build();

    const json = WorkflowSerializer.toJSON(workflow);
    assert.equal(typeof json, "string");

    const parsed = JSON.parse(json);
    assert.equal(parsed.id, "wf1");
    assert.equal(parsed.name, "Test Workflow");
    assert.equal(parsed.description, "A test workflow");
  });

  it("should serialize workflow to object", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const workflow = WorkflowBuilder.create("wf1", "Test").addNode(node1).build();

    const obj = WorkflowSerializer.toObject(workflow);
    assert.equal(obj.id, "wf1");
    assert.equal(obj.name, "Test");
    assert.ok(Array.isArray(obj.nodes));
  });

  it("should deserialize workflow from JSON", () => {
    const node1 = new NodeBuilder("node1", "trigger").parameter("key", "value").build();
    const workflow = WorkflowBuilder.create("wf1", "Test").addNode(node1).build();

    const json = WorkflowSerializer.toJSON(workflow);
    const deserialized = WorkflowSerializer.fromJSON(json);

    assert.equal(deserialized.id, workflow.id);
    assert.equal(deserialized.name, workflow.name);
    assert.equal(deserialized.nodes.length, workflow.nodes.length);
    assert.equal(deserialized.nodes[0].id, node1.id);
    assert.deepEqual(deserialized.nodes[0].parameters, node1.parameters);
  });

  it("should deserialize workflow from object", () => {
    const obj = {
      id: "wf1",
      name: "Test",
      nodes: [
        {
          id: "node1",
          type: "trigger",
          name: "Trigger",
          parameters: { foo: "bar" },
        },
      ],
      connections: [],
    };

    const workflow = WorkflowSerializer.fromObject(obj);
    assert.equal(workflow.id, "wf1");
    assert.equal(workflow.name, "Test");
    assert.equal(workflow.nodes.length, 1);
    assert.equal(workflow.nodes[0].id, "node1");
  });

  it("should preserve all workflow properties", () => {
    const node1 = new NodeBuilder("node1", "trigger").position(100, 200).build();
    const node2 = new NodeBuilder("node2", "action").build();

    const workflow = WorkflowBuilder.create("wf1", "Test")
      .description("Description")
      .metadata({ version: "1.0", author: "Test" })
      .addNode(node1)
      .addNode(node2)
      .connect("node1", "node2", {
        sourceOutput: "main",
        targetInput: "input",
      })
      .build();

    const json = WorkflowSerializer.toJSON(workflow);
    const deserialized = WorkflowSerializer.fromJSON(json);

    assert.equal(deserialized.description, workflow.description);
    assert.deepEqual(deserialized.metadata, workflow.metadata);
    assert.deepEqual(deserialized.nodes[0].position, { x: 100, y: 200 });
    assert.equal(deserialized.connections[0].sourceOutput, "main");
    assert.equal(deserialized.connections[0].targetInput, "input");
  });

  it("should clone a workflow", () => {
    const node1 = new NodeBuilder("node1", "trigger").build();
    const workflow = WorkflowBuilder.create("wf1", "Test").addNode(node1).build();

    const cloned = WorkflowSerializer.clone(workflow);

    // Check essential properties match
    assert.equal(cloned.id, workflow.id);
    assert.equal(cloned.name, workflow.name);
    assert.equal(cloned.nodes.length, workflow.nodes.length);
    assert.equal(cloned.nodes[0].id, workflow.nodes[0].id);
    assert.notEqual(cloned, workflow); // Different object references
  });

  it("should throw error for invalid workflow data", () => {
    assert.throws(() => WorkflowSerializer.fromObject({ name: "Test" }), /missing or invalid id/);

    assert.throws(() => WorkflowSerializer.fromObject({ id: "wf1" }), /missing or invalid name/);

    assert.throws(
      () => WorkflowSerializer.fromObject({ id: "wf1", name: "Test" }),
      /nodes must be an array/,
    );
  });
});
