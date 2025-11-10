import { Node } from "../internal/node.js";
import type { NodeDefinition, ParameterSchema } from "./types.js";

export class NodeRegistry {
	private nodes: Map<string, Node> = new Map();

	registerNode<
		TInputSchema extends ParameterSchema,
		TOutputSchema extends ParameterSchema,
	>(nodeDefinition: NodeDefinition<TInputSchema, TOutputSchema>): void {
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

	getNode<
		TInputSchema extends ParameterSchema = ParameterSchema,
		TOutputSchema extends ParameterSchema = ParameterSchema,
	>(
		typeName: string,
		version: number,
	): NodeDefinition<TInputSchema, TOutputSchema> | undefined {
		const nodeKey = `${typeName}@${version}`;
		const node = this.nodes.get(nodeKey);
		if (!node) {
			return undefined;
		}

		return {
			type: typeName,
			version: version,
			metadata: node.metadata,
			inputSchema: node.inputSchema as TInputSchema,
			outputSchema: node.outputSchema as TOutputSchema,
			execute: node.execute as NodeDefinition<
				TInputSchema,
				TOutputSchema
			>["execute"],
		};
	}

	/**
	 * Get the internal Node instance (used by executor for validation)
	 */
	getNodeInstance(typeName: string, version: number): Node | undefined {
		const nodeKey = `${typeName}@${version}`;
		return this.nodes.get(nodeKey);
	}
}
