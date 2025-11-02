import type { UUID } from "@/public/types/uuid";
import type { EdgeEndpoint } from "./edge-endpoint";

export class Edge {
  private constructor(
    public readonly id: UUID,
    public readonly source: EdgeEndpoint,
    public readonly target: EdgeEndpoint,
  ) {}

  static create(id: UUID, source: EdgeEndpoint, target: EdgeEndpoint): Edge {
    if (!id || id.trim().length === 0) {
      throw new Error("Edge id cannot be empty");
    }
    if (source.nodeId === target.nodeId && source.portId === target.portId) {
      throw new Error("Edge cannot connect a port to itself");
    }
    return new Edge(id, source, target);
  }

  connectsNodes(sourceNodeId: UUID, targetNodeId: UUID): boolean {
    return this.source.nodeId === sourceNodeId && this.target.nodeId === targetNodeId;
  }

  equals(other: Edge): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `Edge(${this.source.toString()} -> ${this.target.toString()})`;
  }
}
