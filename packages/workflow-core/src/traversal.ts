/**
 * Workflow traversal utilities
 */

import type { NodeId, WorkflowDefinition, WorkflowNode } from "./types.js";

/**
 * Traversal order types
 */
export enum TraversalOrder {
  DEPTH_FIRST = "DEPTH_FIRST",
  BREADTH_FIRST = "BREADTH_FIRST",
  TOPOLOGICAL = "TOPOLOGICAL",
}

/**
 * Visitor function for traversal
 */
export type NodeVisitor = (node: WorkflowNode, depth: number) => undefined | boolean;

/**
 * Workflow traversal utilities
 */
export class WorkflowTraversal {
  /**
   * Traverse the workflow starting from a given node
   */
  static traverse(
    workflow: WorkflowDefinition,
    startNodeId: NodeId,
    visitor: NodeVisitor,
    order: TraversalOrder = TraversalOrder.DEPTH_FIRST,
  ): void {
    switch (order) {
      case TraversalOrder.DEPTH_FIRST:
        WorkflowTraversal.dfs(workflow, startNodeId, visitor);
        break;
      case TraversalOrder.BREADTH_FIRST:
        WorkflowTraversal.bfs(workflow, startNodeId, visitor);
        break;
      case TraversalOrder.TOPOLOGICAL:
        WorkflowTraversal.topological(workflow, visitor);
        break;
    }
  }

  /**
   * Depth-first traversal
   */
  private static dfs(
    workflow: WorkflowDefinition,
    startNodeId: NodeId,
    visitor: NodeVisitor,
  ): void {
    const visited = new Set<NodeId>();
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

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

    const dfsRecursive = (nodeId: NodeId, depth: number): boolean => {
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      if (!node) {
        return false;
      }

      const result = visitor(node, depth);
      if (result === false) {
        return false; // Stop traversal
      }

      const neighbors = graph.get(nodeId) || [];
      for (const neighborId of neighbors) {
        if (!dfsRecursive(neighborId, depth + 1)) {
          return false;
        }
      }

      return true;
    };

    dfsRecursive(startNodeId, 0);
  }

  /**
   * Breadth-first traversal
   */
  private static bfs(
    workflow: WorkflowDefinition,
    startNodeId: NodeId,
    visitor: NodeVisitor,
  ): void {
    const visited = new Set<NodeId>();
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

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

    const queue: Array<{ nodeId: NodeId; depth: number }> = [{ nodeId: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const { nodeId, depth } = item;

      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      if (!node) {
        continue;
      }

      const result = visitor(node, depth);
      if (result === false) {
        break; // Stop traversal
      }

      const neighbors = graph.get(nodeId) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          queue.push({ nodeId: neighborId, depth: depth + 1 });
        }
      }
    }
  }

  /**
   * Topological sort traversal
   */
  private static topological(workflow: WorkflowDefinition, visitor: NodeVisitor): void {
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

    // Build adjacency list and in-degree map
    const graph = new Map<NodeId, NodeId[]>();
    const inDegree = new Map<NodeId, number>();

    for (const node of workflow.nodes) {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    for (const connection of workflow.connections) {
      const targets = graph.get(connection.sourceNodeId);
      if (targets) {
        targets.push(connection.targetNodeId);
      }
      inDegree.set(connection.targetNodeId, (inDegree.get(connection.targetNodeId) || 0) + 1);
    }

    // Find all nodes with no incoming edges
    const queue: NodeId[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    let depth = 0;
    while (queue.length > 0) {
      const levelSize = queue.length;

      for (let i = 0; i < levelSize; i++) {
        const nodeId = queue.shift();
        if (!nodeId) continue;

        const node = nodeMap.get(nodeId);
        if (!node) continue;

        const result = visitor(node, depth);
        if (result === false) {
          return; // Stop traversal
        }

        const neighbors = graph.get(nodeId) || [];
        for (const neighborId of neighbors) {
          const newDegree = (inDegree.get(neighborId) || 1) - 1;
          inDegree.set(neighborId, newDegree);
          if (newDegree === 0) {
            queue.push(neighborId);
          }
        }
      }

      depth++;
    }
  }

  /**
   * Find all root nodes (nodes with no incoming connections)
   */
  static findRootNodes(workflow: WorkflowDefinition): WorkflowNode[] {
    const targetNodes = new Set(workflow.connections.map((c) => c.targetNodeId));
    return workflow.nodes.filter((node) => !targetNodes.has(node.id));
  }

  /**
   * Find all leaf nodes (nodes with no outgoing connections)
   */
  static findLeafNodes(workflow: WorkflowDefinition): WorkflowNode[] {
    const sourceNodes = new Set(workflow.connections.map((c) => c.sourceNodeId));
    return workflow.nodes.filter((node) => !sourceNodes.has(node.id));
  }

  /**
   * Get all descendant nodes of a given node
   */
  static getDescendants(workflow: WorkflowDefinition, nodeId: NodeId): WorkflowNode[] {
    const descendants: WorkflowNode[] = [];
    WorkflowTraversal.traverse(workflow, nodeId, (node) => {
      if (node.id !== nodeId) {
        descendants.push(node);
      }
      return undefined;
    });
    return descendants;
  }
}
