import { generateUUID } from "../internal/uuid";
import type { Edge, EdgeEndpoint, Node, NodeSpec, Port, UUID, WorkflowDefinition } from "./types";

interface WorkflowInit {
  name: string;
  version: string;
  description?: string;
}

interface AddNodeInput {
  spec: NodeSpec;
  config: Record<string, unknown>;
  ports: {
    inputs: Array<{ name: string }>;
    outputs: Array<{ name: string }>;
  };
}

interface ConnectInput {
  source: EdgeEndpoint;
  target: EdgeEndpoint;
}

export class WorkflowBuilder {
  private metadata: WorkflowDefinition["metadata"];
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private entrypoints: UUID[] = [];

  private constructor(init: WorkflowInit) {
    this.metadata = {
      name: init.name,
      version: init.version,
      createdAt: new Date().toISOString(),
      description: init.description,
    };
  }

  static init(init: WorkflowInit): WorkflowBuilder {
    return new WorkflowBuilder(init);
  }

  addNode(input: AddNodeInput): UUID {
    const nodeId = generateUUID();

    const inputs: Port[] = input.ports.inputs.map((port) => ({
      id: generateUUID(),
      name: port.name,
    }));

    const outputs: Port[] = input.ports.outputs.map((port) => ({
      id: generateUUID(),
      name: port.name,
    }));

    const node: Node = {
      id: nodeId,
      spec: input.spec,
      config: input.config,
      ports: {
        inputs,
        outputs,
      },
    };

    this.nodes.push(node);

    return nodeId;
  }

  connect(input: ConnectInput): UUID {
    const edgeId = generateUUID();

    const edge: Edge = {
      id: edgeId,
      source: input.source,
      target: input.target,
    };

    this.edges.push(edge);

    return edgeId;
  }

  setEntrypoints(nodeIds: UUID[]): void {
    this.entrypoints = nodeIds;
  }

  build(): WorkflowDefinition {
    return {
      metadata: this.metadata,
      nodes: this.nodes,
      edges: this.edges,
      entrypoints: this.entrypoints,
    };
  }
}
