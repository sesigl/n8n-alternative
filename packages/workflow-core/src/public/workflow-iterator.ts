import type { NodeRegistry } from "@workflow/registry";
import type { Edge } from "../internal/workflow/graph/edge.js";
import type { Node } from "../internal/workflow/graph/node.js";
import type { UUID } from "./types/uuid.js";

export interface ExecutionStep {
  nodeId: UUID;
  nodeType: string;
  nodeVersion: number;
  config: Record<string, unknown>;
  inputs: Record<string, unknown>;
  execute: (inputs: Record<string, string>) => Promise<Record<string, string>>;
}

export class WorkflowIterator {
  private executedNodes: Set<UUID> = new Set();
  private nodeOutputs: Map<UUID, Record<string, string>> = new Map();

  constructor(
    private readonly nodes: Node[],
    private readonly edges: Edge[],
    private readonly entrypoints: UUID[],
    private readonly registry: NodeRegistry,
  ) {}

  getNextStep(): ExecutionStep | null {
    const readyNode = this.findNextReadyNode();
    if (!readyNode) {
      return null;
    }

    this.executedNodes.add(readyNode.id);

    const nodeDefinition = this.registry.getNode(readyNode.spec.type, readyNode.spec.version);

    if (!nodeDefinition) {
      throw new Error(`Node type not found: ${readyNode.spec.type}@${readyNode.spec.version}`);
    }

    const inputs = this.collectInputsForNode(readyNode);

    return {
      nodeId: readyNode.id,
      nodeType: readyNode.spec.type,
      nodeVersion: readyNode.spec.version,
      config: readyNode.config,
      inputs,
      execute: nodeDefinition.execute,
    };
  }

  recordOutput(nodeId: UUID, outputs: Record<string, string>): void {
    this.nodeOutputs.set(nodeId, outputs);
  }

  private findNextReadyNode(): Node | undefined {
    if (this.executedNodes.size === 0) {
      const entrypointNode = this.nodes.find((n) => this.entrypoints.includes(n.id));
      return entrypointNode;
    }

    return this.nodes.find((node) => {
      if (this.executedNodes.has(node.id)) {
        return false;
      }

      const incomingEdges = this.edges.filter((edge) => edge.target.nodeId === node.id);

      if (incomingEdges.length === 0) {
        return false;
      }

      return incomingEdges.every((edge) => this.executedNodes.has(edge.source.nodeId));
    });
  }

  private collectInputsForNode(node: Node): Record<string, unknown> {
    const inputs: Record<string, unknown> = { ...node.config };

    const incomingEdges = this.edges.filter((edge) => edge.target.nodeId === node.id);

    for (const edge of incomingEdges) {
      const sourceOutputs = this.nodeOutputs.get(edge.source.nodeId);
      if (!sourceOutputs) {
        continue;
      }

      const sourceNode = this.nodes.find((n) => n.id === edge.source.nodeId);
      if (!sourceNode) {
        continue;
      }

      const sourcePort = sourceNode.ports.outputs.find((p) => p.id === edge.source.portId);
      if (!sourcePort) {
        continue;
      }

      const targetPort = node.ports.inputs.find((p) => p.id === edge.target.portId);
      if (!targetPort) {
        continue;
      }

      const outputValue = sourceOutputs[sourcePort.name];
      if (outputValue !== undefined) {
        inputs[targetPort.name] = outputValue;
      }
    }

    return inputs;
  }
}
