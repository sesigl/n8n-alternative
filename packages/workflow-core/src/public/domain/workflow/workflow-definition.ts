import type { UUID } from "../../types/uuid";
import type { Edge } from "./edge";
import type { Node } from "./node";
import type { WorkflowMetadata } from "./workflow-metadata";

export class WorkflowDefinition {
  private constructor(
    public readonly metadata: WorkflowMetadata,
    private readonly _nodes: Node[],
    private readonly _edges: Edge[],
    private readonly _entrypoints: UUID[],
  ) {}

  static create(
    metadata: WorkflowMetadata,
    nodes: Node[],
    edges: Edge[],
    entrypoints: UUID[],
  ): WorkflowDefinition {
    return new WorkflowDefinition(metadata, nodes, edges, entrypoints);
  }

  get nodes(): Node[] {
    return [...this._nodes];
  }

  get edges(): Edge[] {
    return [...this._edges];
  }

  get entrypoints(): UUID[] {
    return [...this._entrypoints];
  }

  findNode(nodeId: UUID): Node | undefined {
    return this._nodes.find((node) => node.id === nodeId);
  }

  hasNode(nodeId: UUID): boolean {
    return this._nodes.some((node) => node.id === nodeId);
  }

  findEdge(edgeId: UUID): Edge | undefined {
    return this._edges.find((edge) => edge.id === edgeId);
  }

  getIncomingEdges(nodeId: UUID): Edge[] {
    return this._edges.filter((edge) => edge.target.nodeId === nodeId);
  }

  getOutgoingEdges(nodeId: UUID): Edge[] {
    return this._edges.filter((edge) => edge.source.nodeId === nodeId);
  }

  isEntrypoint(nodeId: UUID): boolean {
    return this._entrypoints.includes(nodeId);
  }

  validate(): void {
    this.validateShape();
    this.detectCycles();
  }

  private validateShape(): void {
    for (const entrypointId of this._entrypoints) {
      if (!this.hasNode(entrypointId)) {
        throw new Error(`Entrypoint references non-existent node: ${entrypointId}`);
      }
    }

    for (const edge of this._edges) {
      if (!this.hasNode(edge.source.nodeId)) {
        throw new Error(`Edge references non-existent source node: ${edge.source.nodeId}`);
      }
      if (!this.hasNode(edge.target.nodeId)) {
        throw new Error(`Edge references non-existent target node: ${edge.target.nodeId}`);
      }
    }
  }

  private detectCycles(): void {
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

  toString(): string {
    return `WorkflowDefinition(${this.metadata.toString()}, ${this._nodes.length} nodes, ${this._edges.length} edges)`;
  }
}
