import { expect } from "vitest";
import type { GraphStructure } from "../src/public/types/graph-structure.js";

export class GraphStructureAsserter {
  constructor(private readonly graph: GraphStructure) {}

  static from(graph: GraphStructure): GraphStructureAsserter {
    return new GraphStructureAsserter(graph);
  }

  hasNodeCount(count: number): this {
    expect(this.graph.nodes).toHaveLength(count);
    return this;
  }

  hasEdgeCount(count: number): this {
    expect(this.graph.edges).toHaveLength(count);
    return this;
  }

  hasEntrypointCount(count: number): this {
    expect(this.graph.entrypoints).toHaveLength(count);
    return this;
  }

  hasNode(nodeId: string): this {
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    expect(node).toBeDefined();
    return this;
  }

  hasNodeWithType(nodeId: string, type: string): this {
    const node = this.graph.nodes.find((n) => n.id === nodeId);
    expect(node).toBeDefined();
    expect(node?.type).toBe(type);
    return this;
  }

  hasEdge(fromNodeId: string, toNodeId: string): this {
    const edge = this.graph.edges.find((e) => e.from === fromNodeId && e.to === toNodeId);
    expect(edge).toBeDefined();
    return this;
  }

  hasEntrypoint(nodeId: string): this {
    expect(this.graph.entrypoints).toContain(nodeId);
    return this;
  }

  hasEntrypoints(nodeIds: string[]): this {
    expect(this.graph.entrypoints).toHaveLength(nodeIds.length);
    for (const nodeId of nodeIds) {
      expect(this.graph.entrypoints).toContain(nodeId);
    }
    return this;
  }
}
