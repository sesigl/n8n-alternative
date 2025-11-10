import { type } from "arktype";
import type {
	InferSchemaType,
	NodeDefinition,
	NodeMetadata,
	ParameterSchema,
} from "../public/types.js";
import { NodeType } from "./node-type.js";

export class Node<
	TInputSchema extends ParameterSchema = ParameterSchema,
	TOutputSchema extends ParameterSchema = ParameterSchema,
> {
	readonly type: NodeType;
	readonly metadata: NodeMetadata;
	readonly inputSchema: TInputSchema;
	readonly outputSchema: TOutputSchema;
	readonly execute: (
		inputs: InferSchemaType<TInputSchema>,
	) => Promise<InferSchemaType<TOutputSchema>>;

	constructor(definition: NodeDefinition<TInputSchema, TOutputSchema>) {
		this.type = new NodeType(definition.type, definition.version);
		this.metadata = definition.metadata;
		this.inputSchema = definition.inputSchema;
		this.outputSchema = definition.outputSchema;
		this.execute = definition.execute;
	}

	/**
	 * Validate inputs against the input schema
	 */
	validateInputs(inputs: unknown): InferSchemaType<TInputSchema> {
		// Create a combined validator for all input parameters
		const inputValidator = type(
			Object.entries(this.inputSchema).reduce(
				(acc, [key, validator]) => {
					acc[key] = validator.infer;
					return acc;
				},
				{} as Record<string, unknown>,
			),
		);

		const result = inputValidator(inputs);
		if (result instanceof type.errors) {
			throw new Error(
				`Input validation failed for node ${this.type.toString()}: ${result.summary}`,
			);
		}

		return result as InferSchemaType<TInputSchema>;
	}

	/**
	 * Validate outputs against the output schema
	 */
	validateOutputs(outputs: unknown): InferSchemaType<TOutputSchema> {
		// Create a combined validator for all output parameters
		const outputValidator = type(
			Object.entries(this.outputSchema).reduce(
				(acc, [key, validator]) => {
					acc[key] = validator.infer;
					return acc;
				},
				{} as Record<string, unknown>,
			),
		);

		const result = outputValidator(outputs);
		if (result instanceof type.errors) {
			throw new Error(
				`Output validation failed for node ${this.type.toString()}: ${result.summary}`,
			);
		}

		return result as InferSchemaType<TOutputSchema>;
	}
}
