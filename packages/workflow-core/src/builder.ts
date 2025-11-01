/**
 * Fluent API for building workflow definitions
 */

import type { NodeId, WorkflowConnection, WorkflowDefinition, WorkflowNode } from "./types.js";

/**
 * Builder for creating workflow nodes
 */
export class NodeBuilder {
  private node: Partial<WorkflowNode>;

  constructor(id: NodeId, type: string) {
    this.node = {
      id,
      type,
      name: `${type}-${id}`,
      parameters: {},
    };
  }

  /**
   * Set the node name
   */
  name(name: string): this {
    this.node = { ...this.node, name };
    return this;
  }

  /**
   * Set node parameters
   */
  parameters(parameters: Record<string, unknown>): this {
    this.node = { ...this.node, parameters };
    return this;
  }

  /**
   * Add a single parameter
   */
  parameter(key: string, value: unknown): this {
    this.node = {
      ...this.node,
      parameters: { ...this.node.parameters, [key]: value },
    };
    return this;
  }

  /**
   * Set node position
   */
  position(x: number, y: number): this {
    this.node = { ...this.node, position: { x, y } };
    return this;
  }

  /**
   * Build the node
   */
  build(): WorkflowNode {
    if (!this.node.id || !this.node.type || !this.node.name) {
      throw new Error("Node must have id, type, and name");
    }
    return this.node as WorkflowNode;
  }
}

/**
 * Builder for creating workflow definitions
 */
export class WorkflowBuilder {
  private workflow: Partial<WorkflowDefinition>;
  private nodeMap: Map<NodeId, WorkflowNode>;
  private connections: WorkflowConnection[];

  constructor(id: string, name: string) {
    this.workflow = {
      id,
      name,
      nodes: [],
      connections: [],
    };
    this.nodeMap = new Map();
    this.connections = [];
  }

  /**
   * Set workflow description
   */
  description(description: string): this {
    this.workflow = { ...this.workflow, description };
    return this;
  }

  /**
   * Set workflow metadata
   */
  metadata(metadata: Record<string, unknown>): this {
    this.workflow = { ...this.workflow, metadata };
    return this;
  }

  /**
   * Add a node to the workflow
   */
  addNode(node: WorkflowNode): this {
    if (this.nodeMap.has(node.id)) {
      throw new Error(`Node with id ${node.id} already exists`);
    }
    this.nodeMap.set(node.id, node);
    return this;
  }

  /**
   * Create and add a node using the builder pattern
   */
  node(id: NodeId, type: string): NodeBuilder {
    const builder = new NodeBuilder(id, type);
    // Create a proxy to capture the built node
    const originalBuild = builder.build.bind(builder);
    builder.build = () => {
      const node = originalBuild();
      this.addNode(node);
      return node;
    };
    return builder;
  }

  /**
   * Connect two nodes
   */
  connect(
    sourceNodeId: NodeId,
    targetNodeId: NodeId,
    options?: {
      sourceOutput?: string;
      targetInput?: string;
    },
  ): this {
    if (!this.nodeMap.has(sourceNodeId)) {
      throw new Error(`Source node ${sourceNodeId} not found`);
    }
    if (!this.nodeMap.has(targetNodeId)) {
      throw new Error(`Target node ${targetNodeId} not found`);
    }

    const connection: WorkflowConnection = {
      id: `${sourceNodeId}-${targetNodeId}`,
      sourceNodeId,
      targetNodeId,
      sourceOutput: options?.sourceOutput,
      targetInput: options?.targetInput,
    };

    this.connections.push(connection);
    return this;
  }

  /**
   * Build the complete workflow definition
   */
  build(): WorkflowDefinition {
    if (!this.workflow.id || !this.workflow.name) {
      throw new Error("Workflow must have id and name");
    }

    return {
      ...this.workflow,
      nodes: Array.from(this.nodeMap.values()),
      connections: this.connections,
    } as WorkflowDefinition;
  }

  /**
   * Static factory method to create a new workflow builder
   */
  static create(id: string, name: string): WorkflowBuilder {
    return new WorkflowBuilder(id, name);
  }
}
