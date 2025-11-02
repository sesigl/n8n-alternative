import { UUIDGenerator } from "../internal/uuid";
import {
  Edge,
  EdgeEndpoint,
  Node,
  NodeSpec,
  Port,
  type UUID,
  WorkflowDefinition,
  WorkflowMetadata,
} from "./types";

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
  source: { nodeId: UUID; portId: UUID };
  target: { nodeId: UUID; portId: UUID };
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
    const nodeId = UUIDGenerator.generate();

    const node = Node.createWithPortNames(
      nodeId,
      NodeSpec.create(input.spec.type, input.spec.version),
      input.config,
      {
        inputs: input.ports.inputs.map((p) => p.name),
        outputs: input.ports.outputs.map((p) => p.name),
      },
      () => UUIDGenerator.generate(),
    );

    this.nodes.push(node);

    return nodeId;
  }

  connect(input: ConnectInput): UUID {
    const edgeId = UUIDGenerator.generate();

    const edge = Edge.create(
      edgeId,
      EdgeEndpoint.create(input.source.nodeId, input.source.portId),
      EdgeEndpoint.create(input.target.nodeId, input.target.portId),
    );

    this.edges.push(edge);

    return edgeId;
  }

  setEntrypoints(nodeIds: UUID[]): void {
    this.entrypoints = nodeIds;
  }

  build(): WorkflowDefinition {
    return WorkflowDefinition.create(this.metadata, this.nodes, this.edges, this.entrypoints);
  }
}
