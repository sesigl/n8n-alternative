/**
 * @workflow/core - Core types, builder API, validation, and traversal utilities for workflow definitions
 */

// Export builder API
export { NodeBuilder, WorkflowBuilder } from "./builder.js";
export type { SerializationOptions } from "./serializer.js";
// Export serialization
export { WorkflowSerializer } from "./serializer.js";
export type { NodeVisitor } from "./traversal.js";

// Export traversal utilities
export { TraversalOrder, WorkflowTraversal } from "./traversal.js";
// Export types
export type {
  ConnectionId,
  NodeId,
  Position,
  ValidationError,
  ValidationResult,
  WorkflowConnection,
  WorkflowDefinition,
  WorkflowId,
  WorkflowNode,
} from "./types.js";
export { ValidationErrorType } from "./types.js";
// Export validation
export { WorkflowValidator } from "./validator.js";
