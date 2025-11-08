import { Node } from "../internal/node.js";
import type { NodeDefinition } from "./types.js";

export class NodeRegistry {
  private nodes: Map<string, Node> = new Map();

  registerNode(nodeDefinition: NodeDefinition): void {
    const node = new Node(nodeDefinition);
    const typeName = node.type.toString();

    if (this.nodes.has(typeName)) {
      throw new Error(`Node type ${typeName} is already registered`);
    }

    this.nodes.set(typeName, node);
  }

  listNodeTypes(): string[] {
    return Array.from(this.nodes.keys());
  }

  getNode(typeName: string, version: number): NodeDefinition | undefined {
    const nodeKey = `${typeName}@${version}`;
    const node = this.nodes.get(nodeKey);
    if (!node) {
      return undefined;
    }

    return {
      type: typeName,
      version: version,
      metadata: node.metadata,
      inputs: node.inputs,
      outputs: node.outputs,
      execute: node.execute,
    };
  }
}
