import { type Type, type } from "arktype";

// ============================================
// ArkType-Based Schema System
// ============================================

/**
 * Parameter schema type - maps parameter names to their ArkType validators
 */
export type ParameterSchema = Record<string, Type>;

/**
 * Helper to infer TypeScript types from ArkType schemas
 */
export type InferSchemaType<S extends ParameterSchema> = {
	[K in keyof S]: S[K] extends Type<infer T> ? T : never;
};

/**
 * Node metadata interface
 */
export interface NodeMetadata {
	name: string;
	description: string;
}

/**
 * Workflow node definition with ArkType schemas
 *
 * @template TInputSchema - ArkType schema for input parameters
 * @template TOutputSchema - ArkType schema for output parameters
 */
export interface NodeDefinition<
	TInputSchema extends ParameterSchema = ParameterSchema,
	TOutputSchema extends ParameterSchema = ParameterSchema,
> {
	type: string;
	version: number;
	metadata: NodeMetadata;
	inputSchema: TInputSchema;
	outputSchema: TOutputSchema;
	execute: (
		inputs: InferSchemaType<TInputSchema>,
	) => Promise<InferSchemaType<TOutputSchema>>;
}

/**
 * Validation error class for ArkType validation failures
 */
export class NodeValidationError extends Error {
	constructor(
		message: string,
		public readonly validationErrors: string,
	) {
		super(message);
		this.name = "NodeValidationError";
	}
}

/**
 * Helper function to create a node definition with type safety
 */
export function defineNode<
	TInputSchema extends ParameterSchema,
	TOutputSchema extends ParameterSchema,
>(
	definition: NodeDefinition<TInputSchema, TOutputSchema>,
): NodeDefinition<TInputSchema, TOutputSchema> {
	return definition;
}

/**
 * Helper function to create a parameter schema from an object of type definitions
 */
export function createSchema<T extends ParameterSchema>(schema: T): T {
	return schema;
}
