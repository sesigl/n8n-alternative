import type { NodeDefinition, NodeMetadata } from "../public/types.js";
import { NodeType } from "./node-type.js";

export class Node {
  readonly type: NodeType;
  readonly metadata: NodeMetadata;
  readonly inputs: Record<string, string>;
  readonly outputs: Record<string, string>;
  readonly execute: (inputs: Record<string, string>) => Promise<Record<string, string>>;

  constructor(definition: NodeDefinition) {
    this.type = new NodeType(definition.type, definition.version);
    this.metadata = definition.metadata;
    this.inputs = definition.inputs;
    this.outputs = definition.outputs;
    this.execute = definition.execute;
  }
}
