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
});
