import { generateUUID } from "../internal/uuid";
import type { Node, NodeSpec, Port, UUID, WorkflowDefinition } from "./types";

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

export class WorkflowBuilder {
  private metadata: WorkflowDefinition["metadata"];
  private nodes: Node[] = [];

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

  build(): WorkflowDefinition {
    return {
      metadata: this.metadata,
      nodes: this.nodes,
      edges: [],
      entrypoints: [],
    };
  }
}
