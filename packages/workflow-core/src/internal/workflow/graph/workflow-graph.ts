import type { UUID } from "../../../public/types/uuid.js";
import type { Edge } from "./edge.js";
import type { Node } from "./node.js";

export class WorkflowGraph {
  private constructor(
    private readonly _nodes: Node[],
    private readonly _edges: Edge[],
  ) {}

  static create(nodes: Node[], edges: Edge[]): WorkflowGraph {
    return new WorkflowGraph([...nodes], [...edges]);
  }

  get nodes(): Node[] {
    return [...this._nodes];
  }

  get edges(): Edge[] {
    return [...this._edges];
  }

  findNode(nodeId: UUID): Node | undefined {
    return this._nodes.find((node) => node.id === nodeId);
  }

  hasNode(nodeId: UUID): boolean {
    return this._nodes.some((node) => node.id === nodeId);
  }

  validateEdgeReferences(): void {
    for (const edge of this._edges) {
      if (!this.hasNode(edge.source.nodeId)) {
        throw new Error(`Edge references non-existent source node: ${edge.source.nodeId}`);
      }
      if (!this.hasNode(edge.target.nodeId)) {
        throw new Error(`Edge references non-existent target node: ${edge.target.nodeId}`);
      }
    }
  }

  validateAcyclic(): void {
    const adjacencyMap = new Map<UUID, UUID[]>();

    for (const node of this._nodes) {
      adjacencyMap.set(node.id, []);
    }

    for (const edge of this._edges) {
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

    for (const node of this._nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          throw new Error("Cycle detected in workflow");
        }
      }
    }
  }
}
