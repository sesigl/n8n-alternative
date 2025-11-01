/**
 * @workflow/registry - Node specifications with validation schemas and registry implementation
 */

// Export schema types and validator
export {
  ParameterType,
  SchemaValidator,
} from './schema.js';

export type {
  ParameterSchema,
  StringParameterSchema,
  NumberParameterSchema,
  BooleanParameterSchema,
  ObjectParameterSchema,
  ArrayParameterSchema,
  AnyParameterSchema,
  SchemaDefinition,
  SchemaValidationError,
  SchemaValidationResult,
} from './schema.js';

// Export node specification types and builder
export {
  NodeCategory,
  NodeSpecBuilder,
} from './node-spec.js';

export type {
  IOSpec,
  NodeSpec,
} from './node-spec.js';

// Export registry
export {
  NodeRegistry,
  defaultRegistry,
} from './registry.js';
