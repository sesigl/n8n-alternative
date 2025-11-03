import { Node } from "@/internal/node.js";
import type { NodeDefinition } from "@/public/types.js";

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

  getNode(typeName: string): NodeDefinition | undefined {
    const node = this.nodes.get(typeName);
    if (!node) {
      return undefined;
    }

    return {
      type: node.type.toString(),
      metadata: node.metadata,
      inputs: node.inputs,
      outputs: node.outputs,
      execute: node.execute,
    };
  }
}
