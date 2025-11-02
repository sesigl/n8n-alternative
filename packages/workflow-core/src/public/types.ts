export type UUID = string;

export interface NodeSpec {
  type: string;
  version: number;
}

export interface Port {
  id: UUID;
  name: string;
}

export interface Node {
  id: UUID;
  spec: NodeSpec;
  config: Record<string, unknown>;
  ports: {
    inputs: Port[];
    outputs: Port[];
  };
}

export interface EdgeEndpoint {
  nodeId: UUID;
  portId: UUID;
}

export interface Edge {
  id: UUID;
  source: EdgeEndpoint;
  target: EdgeEndpoint;
}

export interface WorkflowMetadata {
  name: string;
  version: string;
  createdAt: string;
  description?: string;
}

export interface WorkflowDefinition {
  metadata: WorkflowMetadata;
  nodes: Node[];
  edges: Edge[];
  entrypoints: UUID[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface Registry {
  has(spec: NodeSpec): boolean;
  validate(spec: NodeSpec, config: Record<string, unknown>): ValidationResult;
}
