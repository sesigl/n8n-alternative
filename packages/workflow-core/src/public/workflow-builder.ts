import type { NodeRegistry } from "@workflow/registry";
import { generateUUID } from "@/internal/uuid";
import { Edge } from "@/internal/workflow/graph/edge";
import { EdgeEndpoint } from "@/internal/workflow/graph/edge-endpoint";
import { Node } from "@/internal/workflow/graph/node";
import { NodeSpec } from "@/internal/workflow/metadata/node-spec";
import { WorkflowMetadata } from "@/internal/workflow/metadata/workflow-metadata";
import type { UUID } from "@/public/types/uuid";
import { WorkflowDefinition } from "@/public/workflow-definition";

interface WorkflowInit {
  name: string;
  version: string;
  description?: string;
}

interface AddNodeInput {
  spec: { type: string; version: number };
  config: Record<string, unknown>;
  ports: {
    inputs: Array<{ name: string }>;
    outputs: Array<{ name: string }>;
  };
}

interface ConnectInput {
  source: { nodeId: UUID; portName: string };
  target: { nodeId: UUID; portName: string };
}

export class WorkflowBuilder {
  private metadata: WorkflowMetadata;
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private entrypoints: UUID[] = [];

  private constructor(init: WorkflowInit) {
    this.metadata = WorkflowMetadata.create(
      init.name,
      init.version,
      new Date().toISOString(),
      init.description,
    );
  }

  static init(init: WorkflowInit): WorkflowBuilder {
    return new WorkflowBuilder(init);
  }

  addNode(input: AddNodeInput): UUID {
    const nodeId = generateUUID();

    const node = Node.createWithPortNames(
      nodeId,
      NodeSpec.create(input.spec.type, input.spec.version),
      input.config,
      {
        inputs: input.ports.inputs.map((p) => p.name),
        outputs: input.ports.outputs.map((p) => p.name),
      },
      () => generateUUID(),
    );

    this.nodes.push(node);

    return nodeId;
  }

  connect(input: ConnectInput): UUID {
    const sourceNode = this.nodes.find((n) => n.id === input.source.nodeId);
    if (!sourceNode) {
      throw new Error(`Source node not found: ${input.source.nodeId}`);
    }

    const targetNode = this.nodes.find((n) => n.id === input.target.nodeId);
    if (!targetNode) {
      throw new Error(`Target node not found: ${input.target.nodeId}`);
    }

    const sourcePort = sourceNode.ports.outputs.find((p) => p.name === input.source.portName);
    if (!sourcePort) {
      throw new Error(
        `Output port '${input.source.portName}' not found on node ${input.source.nodeId}`,
      );
    }

    const targetPort = targetNode.ports.inputs.find((p) => p.name === input.target.portName);
    if (!targetPort) {
      throw new Error(
        `Input port '${input.target.portName}' not found on node ${input.target.nodeId}`,
      );
    }

    const edgeId = generateUUID();

    const edge = Edge.create(
      edgeId,
      EdgeEndpoint.create(input.source.nodeId, sourcePort.id),
      EdgeEndpoint.create(input.target.nodeId, targetPort.id),
    );

    this.edges.push(edge);

    return edgeId;
  }

  setEntrypoints(nodeIds: UUID[]): void {
    this.entrypoints = nodeIds;
  }

  build(registry: NodeRegistry): WorkflowDefinition {
    return WorkflowDefinition.create(
      this.metadata,
      this.nodes,
      this.edges,
      this.entrypoints,
      registry,
    );
  }
}
