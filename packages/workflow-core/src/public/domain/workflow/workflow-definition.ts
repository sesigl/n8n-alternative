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
    const workflow = new WorkflowDefinition(metadata, nodes, edges, entrypoints);
    workflow.validate();
    return workflow;
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

  private validate(): void {
    this.graph.validateEdgeReferences();
    this.entrypointsVO.validateAgainstGraph(this.graph);
    this.graph.validateAcyclic();
  }

  toString(): string {
    return `WorkflowDefinition(${this.metadata.toString()}, ${this.graph.nodeCount} nodes, ${this.graph.edgeCount} edges)`;
  }
}
