import type { UUID } from "../../types/uuid";
import type { Edge } from "./edge";
import { Entrypoints } from "./entrypoints";
import type { Node } from "./node";
import { WorkflowGraph } from "./workflow-graph";
import type { WorkflowMetadata } from "./workflow-metadata";

export class WorkflowDefinition {
  private readonly graph: WorkflowGraph;
  private readonly entrypointsVO: Entrypoints;

  private constructor(
    public readonly metadata: WorkflowMetadata,
    nodes: Node[],
    edges: Edge[],
    entrypoints: UUID[],
  ) {
    this.graph = WorkflowGraph.create(nodes, edges);
    this.entrypointsVO = Entrypoints.create(entrypoints);
  }

  static create(
    metadata: WorkflowMetadata,
    nodes: Node[],
    edges: Edge[],
    entrypoints: UUID[],
  ): WorkflowDefinition {
    return new WorkflowDefinition(metadata, nodes, edges, entrypoints);
  }

  get nodes(): Node[] {
    return this.graph.nodes;
  }

  get edges(): Edge[] {
    return this.graph.edges;
  }

  get entrypoints(): UUID[] {
    return this.entrypointsVO.entrypoints;
  }

  findNode(nodeId: UUID): Node | undefined {
    return this.graph.findNode(nodeId);
  }

  hasNode(nodeId: UUID): boolean {
    return this.graph.hasNode(nodeId);
  }

  findEdge(edgeId: UUID): Edge | undefined {
    return this.graph.findEdge(edgeId);
  }

  getIncomingEdges(nodeId: UUID): Edge[] {
    return this.graph.getIncomingEdges(nodeId);
  }

  getOutgoingEdges(nodeId: UUID): Edge[] {
    return this.graph.getOutgoingEdges(nodeId);
  }

  isEntrypoint(nodeId: UUID): boolean {
    return this.entrypointsVO.isEntrypoint(nodeId);
  }

  validate(): void {
    this.graph.validateEdgeReferences();
    this.entrypointsVO.validateAgainstGraph(this.graph);
    this.graph.validateAcyclic();
  }

  toString(): string {
    return `WorkflowDefinition(${this.metadata.toString()}, ${this.graph.nodeCount} nodes, ${this.graph.edgeCount} edges)`;
  }
}
