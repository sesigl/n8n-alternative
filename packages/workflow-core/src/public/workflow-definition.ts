import type { NodeRegistry } from "@workflow/registry";
import type { Edge } from "../internal/workflow/graph/edge.js";
import type { Node } from "../internal/workflow/graph/node.js";
import { WorkflowGraph } from "../internal/workflow/graph/workflow-graph.js";
import type { WorkflowMetadata } from "../internal/workflow/metadata/workflow-metadata.js";
import { Entrypoints } from "../internal/workflow/validation/entrypoints.js";
import type { GraphStructure } from "./types/graph-structure.js";
import type { UUID } from "./types/uuid.js";
import { WorkflowIterator } from "./workflow-iterator.js";

export class WorkflowDefinition {
  private readonly graph: WorkflowGraph;
  private readonly entrypointsVO: Entrypoints;
  private readonly registry: NodeRegistry;

  private constructor(
    public readonly metadata: WorkflowMetadata,
    nodes: Node[],
    edges: Edge[],
    entrypoints: UUID[],
    registry: NodeRegistry,
  ) {
    this.graph = WorkflowGraph.create(nodes, edges);
    this.entrypointsVO = Entrypoints.create(entrypoints);
    this.registry = registry;
  }

  static create(
    metadata: WorkflowMetadata,
    nodes: Node[],
    edges: Edge[],
    entrypoints: UUID[],
    registry: NodeRegistry,
  ): WorkflowDefinition {
    const workflow = new WorkflowDefinition(metadata, nodes, edges, entrypoints, registry);
    workflow.validate();
    return workflow;
  }

  private validate(): void {
    this.graph.validateEdgeReferences();
    this.entrypointsVO.validateAgainstGraph(this.graph);
    this.graph.validateAcyclic();
    this.validateAgainstRegistry();
  }

  private validateAgainstRegistry(): void {
    for (const node of this.graph.nodes) {
      if (!this.registry.getNode(node.spec.type, node.spec.version)) {
        throw new Error(`Node type not found: ${node.spec.type}@${node.spec.version}`);
      }
    }
  }

  createIterator(): WorkflowIterator {
    return new WorkflowIterator(
      this.graph.nodes,
      this.graph.edges,
      this.entrypointsVO.entrypoints,
      this.registry,
    );
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
}
