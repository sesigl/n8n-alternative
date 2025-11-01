/**
 * Workflow validation utilities
 */

import type { NodeId, ValidationError, ValidationResult, WorkflowDefinition } from "./types.js";
import { ValidationErrorType } from "./types.js";

/**
 * Validates a workflow definition
 */
export class WorkflowValidator {
  /**
   * Validate a complete workflow
   */
  static validate(workflow: WorkflowDefinition): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate structure
    errors.push(...WorkflowValidator.validateStructure(workflow));

    // Validate node uniqueness
    errors.push(...WorkflowValidator.validateNodeUniqueness(workflow));

    // Validate connections
    errors.push(...WorkflowValidator.validateConnections(workflow));

    // Detect cycles
    errors.push(...WorkflowValidator.detectCycles(workflow));

    // Check for orphaned nodes
    errors.push(...WorkflowValidator.validateOrphanedNodes(workflow));

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate basic workflow structure
   */
  private static validateStructure(workflow: WorkflowDefinition): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!workflow.id) {
      errors.push({
        type: ValidationErrorType.INVALID_PARAMETERS,
        message: "Workflow must have an id",
        path: ["id"],
      });
    }

    if (!workflow.name) {
      errors.push({
        type: ValidationErrorType.INVALID_PARAMETERS,
        message: "Workflow must have a name",
        path: ["name"],
      });
    }

    // Validate each node has required fields
    for (const node of workflow.nodes) {
      if (!node.id) {
        errors.push({
          type: ValidationErrorType.INVALID_PARAMETERS,
          message: "Node must have an id",
          nodeId: node.id,
        });
      }
      if (!node.type) {
        errors.push({
          type: ValidationErrorType.INVALID_NODE_TYPE,
          message: "Node must have a type",
          nodeId: node.id,
        });
      }
      if (!node.name) {
        errors.push({
          type: ValidationErrorType.INVALID_PARAMETERS,
          message: "Node must have a name",
          nodeId: node.id,
        });
      }
    }

    return errors;
  }

  /**
   * Validate that all node IDs are unique
   */
  private static validateNodeUniqueness(workflow: WorkflowDefinition): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = new Set<NodeId>();

    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push({
          type: ValidationErrorType.DUPLICATE_NODE_ID,
          message: `Duplicate node id: ${node.id}`,
          nodeId: node.id,
        });
      }
      nodeIds.add(node.id);
    }

    return errors;
  }

  /**
   * Validate that all connections reference existing nodes
   */
  private static validateConnections(workflow: WorkflowDefinition): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = new Set(workflow.nodes.map((n) => n.id));

    for (const connection of workflow.connections) {
      if (!nodeIds.has(connection.sourceNodeId)) {
        errors.push({
          type: ValidationErrorType.MISSING_NODE,
          message: `Connection references non-existent source node: ${connection.sourceNodeId}`,
          connectionId: connection.id,
          nodeId: connection.sourceNodeId,
        });
      }
      if (!nodeIds.has(connection.targetNodeId)) {
        errors.push({
          type: ValidationErrorType.MISSING_NODE,
          message: `Connection references non-existent target node: ${connection.targetNodeId}`,
          connectionId: connection.id,
          nodeId: connection.targetNodeId,
        });
      }
    }

    return errors;
  }

  /**
   * Detect cycles in the workflow graph using DFS
   */
  private static detectCycles(workflow: WorkflowDefinition): ValidationError[] {
    const errors: ValidationError[] = [];
    const nodeIds = workflow.nodes.map((n) => n.id);

    // Build adjacency list
    const graph = new Map<NodeId, NodeId[]>();
    for (const node of workflow.nodes) {
      graph.set(node.id, []);
    }
    for (const connection of workflow.connections) {
      const targets = graph.get(connection.sourceNodeId);
      if (targets) {
        targets.push(connection.targetNodeId);
      }
    }

    // DFS with state tracking
    const WHITE = 0; // Unvisited
    const GRAY = 1; // Visiting
    const BLACK = 2; // Visited

    const state = new Map<NodeId, number>();
    const parent = new Map<NodeId, NodeId | null>();

    for (const nodeId of nodeIds) {
      state.set(nodeId, WHITE);
      parent.set(nodeId, null);
    }

    const dfs = (nodeId: NodeId, path: NodeId[]): boolean => {
      state.set(nodeId, GRAY);

      const neighbors = graph.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const neighborState = state.get(neighbor);

        if (neighborState === GRAY) {
          // Back edge detected - cycle found
          const cycleStart = path.indexOf(neighbor);
          const cycle = [...path.slice(cycleStart), neighbor];
          errors.push({
            type: ValidationErrorType.CYCLE_DETECTED,
            message: `Cycle detected: ${cycle.join(" -> ")}`,
            nodeId,
          });
          return true;
        }

        if (neighborState === WHITE) {
          parent.set(neighbor, nodeId);
          if (dfs(neighbor, [...path, nodeId])) {
            return true;
          }
        }
      }

      state.set(nodeId, BLACK);
      return false;
    };

    // Check each unvisited node
    for (const nodeId of nodeIds) {
      if (state.get(nodeId) === WHITE) {
        dfs(nodeId, []);
      }
    }

    return errors;
  }

  /**
   * Check for orphaned nodes (nodes with no connections)
   */
  private static validateOrphanedNodes(workflow: WorkflowDefinition): ValidationError[] {
    const errors: ValidationError[] = [];

    // If there are no nodes or only one node, skip this check
    if (workflow.nodes.length <= 1) {
      return errors;
    }

    const connectedNodes = new Set<NodeId>();

    for (const connection of workflow.connections) {
      connectedNodes.add(connection.sourceNodeId);
      connectedNodes.add(connection.targetNodeId);
    }

    for (const node of workflow.nodes) {
      if (!connectedNodes.has(node.id)) {
        errors.push({
          type: ValidationErrorType.ORPHANED_NODE,
          message: `Node ${node.id} has no connections`,
          nodeId: node.id,
        });
      }
    }

    return errors;
  }
}
