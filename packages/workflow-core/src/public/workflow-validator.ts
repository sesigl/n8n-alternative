import type { UUID, WorkflowDefinition } from "./types";

export class WorkflowValidator {
  validate(workflow: WorkflowDefinition): void {
    this.validateShape(workflow);
    this.detectCycles(workflow);
  }

  private validateShape(workflow: WorkflowDefinition): void {
    const nodeIds = new Set(workflow.nodes.map((node) => node.id));

    for (const entrypointId of workflow.entrypoints) {
      if (!nodeIds.has(entrypointId)) {
        throw new Error(`Entrypoint references non-existent node: ${entrypointId}`);
      }
    }

    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source.nodeId)) {
        throw new Error(`Edge references non-existent source node: ${edge.source.nodeId}`);
      }
      if (!nodeIds.has(edge.target.nodeId)) {
        throw new Error(`Edge references non-existent target node: ${edge.target.nodeId}`);
      }
    }
  }

  private detectCycles(workflow: WorkflowDefinition): void {
    const adjacencyMap = new Map<UUID, UUID[]>();

    for (const node of workflow.nodes) {
      adjacencyMap.set(node.id, []);
    }

    for (const edge of workflow.edges) {
      const targets = adjacencyMap.get(edge.source.nodeId);
      if (targets) {
        targets.push(edge.target.nodeId);
      }
    }

    const visited = new Set<UUID>();
    const recursionStack = new Set<UUID>();

    const hasCycle = (nodeId: UUID): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyMap.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          throw new Error("Cycle detected in workflow");
        }
      }
    }
  }
}
