import { Port } from "@/internal/workflow/graph/port";
import type { NodeSpec } from "@/internal/workflow/metadata/node-spec";
import type { UUID } from "@/public/types/uuid";

export class Node {
  private constructor(
    public readonly id: UUID,
    public readonly spec: NodeSpec,
    public readonly config: Record<string, unknown>,
    private readonly _ports: {
      inputs: Port[];
      outputs: Port[];
    },
  ) {}

  static create(
    id: UUID,
    spec: NodeSpec,
    config: Record<string, unknown>,
    ports: {
      inputs: Port[];
      outputs: Port[];
    },
  ): Node {
    if (!id || id.trim().length === 0) {
      throw new Error("Node id cannot be empty");
    }
    return new Node(id, spec, config, ports);
  }

  static createWithPortNames(
    id: UUID,
    spec: NodeSpec,
    config: Record<string, unknown>,
    portNames: {
      inputs: string[];
      outputs: string[];
    },
    generateId: () => UUID,
  ): Node {
    const inputs = portNames.inputs.map((name) => Port.create(generateId(), name));
    const outputs = portNames.outputs.map((name) => Port.create(generateId(), name));

    return Node.create(id, spec, config, { inputs, outputs });
  }

  get ports(): { inputs: Port[]; outputs: Port[] } {
    return {
      inputs: [...this._ports.inputs],
      outputs: [...this._ports.outputs],
    };
  }
}
