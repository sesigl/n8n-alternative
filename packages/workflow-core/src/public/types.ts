/**
 * Branded type for unique identifiers
 */
export type UUID = string & { readonly __brand: "UUID" };

/**
 * Reference to a node type and version
 */
export interface NodeSpec {
  type: string;
  version: number;
}

/**
 * Port definition for node inputs/outputs
 */
export interface Port {
  id: UUID;
  name: string;
}

/**
 * Node definition in a workflow
 */
export interface Node {
  id: UUID;
  spec: NodeSpec;
  config: Record<string, unknown>;
  ports: {
    inputs: Port[];
    outputs: Port[];
  };
}

/**
 * Connection point in a workflow edge
 */
export interface EdgeEndpoint {
  nodeId: UUID;
  portId: UUID;
}

/**
 * Edge connecting two nodes
 */
export interface Edge {
  id: UUID;
  source: EdgeEndpoint;
  target: EdgeEndpoint;
}

/**
 * Workflow metadata
 */
export interface WorkflowMetadata {
  name: string;
  version: string;
  createdAt: string;
  description?: string;
}

/**
 * Complete workflow definition
 */
export interface WorkflowDefinition {
  metadata: WorkflowMetadata;
  nodes: Node[];
  edges: Edge[];
  entrypoints: UUID[];
}
