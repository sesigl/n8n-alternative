import type { NodeRegistry } from "@workflow/registry";
import type { Edge } from "@/internal/workflow/graph/edge";
import type { Node } from "@/internal/workflow/graph/node";
import { WorkflowGraph } from "@/internal/workflow/graph/workflow-graph";
import type { WorkflowMetadata } from "@/internal/workflow/metadata/workflow-metadata";
import { Entrypoints } from "@/internal/workflow/validation/entrypoints";
import type { GraphStructure } from "@/public/types/graph-structure";
import type { UUID } from "@/public/types/uuid";

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
    registry: NodeRegistry,
  ): WorkflowDefinition {
    const workflow = new WorkflowDefinition(metadata, nodes, edges, entrypoints);
    workflow.validate(registry);
    return workflow;
  }

  private validate(registry: NodeRegistry): void {
    this.graph.validateEdgeReferences();
    this.entrypointsVO.validateAgainstGraph(this.graph);
    this.graph.validateAcyclic();
    this.validateAgainstRegistry(registry);
  }

  private validateAgainstRegistry(registry: NodeRegistry): void {
    for (const node of this.graph.nodes) {
      if (!registry.getNode(node.spec.type, node.spec.version)) {
        throw new Error(`Node type not found: ${node.spec.type}@${node.spec.version}`);
      }
    }
  }

  getGraphStructure(): GraphStructure {
    return {
      nodes: this.graph.nodes.map((node) => ({
        id: node.id,
        type: node.spec.type,
      })),
      edges: this.graph.edges.map((edge) => ({
        from: edge.source.nodeId,
        to: edge.target.nodeId,
      })),
      entrypoints: this.entrypointsVO.entrypoints,
    };
  }

  toString(): string {
    return `WorkflowDefinition(${this.metadata.toString()}, ${this.graph.nodeCount} nodes, ${this.graph.edgeCount} edges)`;
  }
}
