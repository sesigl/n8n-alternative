/**
 * Workflow serialization utilities for immutable JSON export
 */

import type { WorkflowDefinition } from "./types.js";

/**
 * Serialization options
 */
export interface SerializationOptions {
  /**
   * Pretty print the JSON output
   */
  readonly pretty?: boolean;
  /**
   * Include metadata in serialization
   */
  readonly includeMetadata?: boolean;
}

/**
 * Workflow serializer
 */
export class WorkflowSerializer {
  /**
   * Serialize a workflow to JSON string
   */
  static toJSON(workflow: WorkflowDefinition, options: SerializationOptions = {}): string {
    const data = WorkflowSerializer.prepare(workflow, options);
    return options.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Serialize a workflow to a plain object
   */
  static toObject(
    workflow: WorkflowDefinition,
    options: SerializationOptions = {},
  ): Record<string, unknown> {
    return WorkflowSerializer.prepare(workflow, options);
  }

  /**
   * Deserialize a workflow from JSON string
   */
  static fromJSON(json: string): WorkflowDefinition {
    const data = JSON.parse(json);
    return WorkflowSerializer.parse(data);
  }

  /**
   * Deserialize a workflow from a plain object
   */
  static fromObject(obj: Record<string, unknown>): WorkflowDefinition {
    return WorkflowSerializer.parse(obj);
  }

  /**
   * Prepare workflow data for serialization
   */
  private static prepare(
    workflow: WorkflowDefinition,
    options: SerializationOptions,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {
      id: workflow.id,
      name: workflow.name,
      nodes: workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        name: node.name,
        parameters: node.parameters,
        ...(node.position && { position: node.position }),
      })),
      connections: workflow.connections.map((conn) => ({
        id: conn.id,
        sourceNodeId: conn.sourceNodeId,
        targetNodeId: conn.targetNodeId,
        ...(conn.sourceOutput && { sourceOutput: conn.sourceOutput }),
        ...(conn.targetInput && { targetInput: conn.targetInput }),
      })),
    };

    if (workflow.description) {
      data.description = workflow.description;
    }

    if (options.includeMetadata !== false && workflow.metadata) {
      data.metadata = workflow.metadata;
    }

    return data;
  }

  /**
   * Parse workflow data from deserialization
   */
  private static parse(data: Record<string, unknown>): WorkflowDefinition {
    if (!data.id || typeof data.id !== "string") {
      throw new Error("Invalid workflow: missing or invalid id");
    }

    if (!data.name || typeof data.name !== "string") {
      throw new Error("Invalid workflow: missing or invalid name");
    }

    if (!Array.isArray(data.nodes)) {
      throw new Error("Invalid workflow: nodes must be an array");
    }

    if (!Array.isArray(data.connections)) {
      throw new Error("Invalid workflow: connections must be an array");
    }

    return {
      id: data.id,
      name: data.name,
      description: typeof data.description === "string" ? data.description : undefined,
      nodes: (data.nodes as unknown[]).map((node: unknown) => {
        const n = node as Record<string, unknown>;
        return {
          id: n.id as string,
          type: n.type as string,
          name: n.name as string,
          parameters: (n.parameters || {}) as Record<string, unknown>,
          position: n.position as { x: number; y: number } | undefined,
        };
      }),
      connections: (data.connections as unknown[]).map((conn: unknown) => {
        const c = conn as Record<string, unknown>;
        return {
          id: c.id as string,
          sourceNodeId: c.sourceNodeId as string,
          targetNodeId: c.targetNodeId as string,
          sourceOutput: c.sourceOutput as string | undefined,
          targetInput: c.targetInput as string | undefined,
        };
      }),
      metadata:
        typeof data.metadata === "object" && data.metadata !== null
          ? (data.metadata as Record<string, unknown>)
          : undefined,
    };
  }

  /**
   * Clone a workflow (deep copy)
   */
  static clone(workflow: WorkflowDefinition): WorkflowDefinition {
    return WorkflowSerializer.fromJSON(WorkflowSerializer.toJSON(workflow));
  }
}
