/**
 * Core types for workflow definitions
 */

/**
 * Unique identifier for workflow elements
 */
export type WorkflowId = string;
export type NodeId = string;
export type ConnectionId = string;

/**
 * Position coordinates for visual layout
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * Base node definition in a workflow
 */
export interface WorkflowNode {
  readonly id: NodeId;
  readonly type: string;
  readonly name: string;
  readonly parameters: Record<string, unknown>;
  readonly position?: Position;
}

/**
 * Connection between nodes in a workflow
 */
export interface WorkflowConnection {
  readonly id: ConnectionId;
  readonly sourceNodeId: NodeId;
  readonly targetNodeId: NodeId;
  readonly sourceOutput?: string;
  readonly targetInput?: string;
}

/**
 * Complete workflow definition
 */
export interface WorkflowDefinition {
  readonly id: WorkflowId;
  readonly name: string;
  readonly description?: string;
  readonly nodes: readonly WorkflowNode[];
  readonly connections: readonly WorkflowConnection[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * Validation error types
 */
export enum ValidationErrorType {
  MISSING_NODE = "MISSING_NODE",
  DUPLICATE_NODE_ID = "DUPLICATE_NODE_ID",
  INVALID_CONNECTION = "INVALID_CONNECTION",
  CYCLE_DETECTED = "CYCLE_DETECTED",
  INVALID_NODE_TYPE = "INVALID_NODE_TYPE",
  INVALID_PARAMETERS = "INVALID_PARAMETERS",
  ORPHANED_NODE = "ORPHANED_NODE",
}

/**
 * Validation error result
 */
export interface ValidationError {
  readonly type: ValidationErrorType;
  readonly message: string;
  readonly nodeId?: NodeId;
  readonly connectionId?: ConnectionId;
  readonly path?: string[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ValidationError[];
}
