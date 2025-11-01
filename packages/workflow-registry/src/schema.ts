/**
 * Schema definitions for node parameters
 */

/**
 * Supported parameter types
 */
export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  ANY = 'any',
}

/**
 * Base parameter schema
 */
export interface ParameterSchema {
  readonly type: ParameterType;
  readonly description?: string;
  readonly required?: boolean;
  readonly default?: unknown;
}

/**
 * String parameter schema
 */
export interface StringParameterSchema extends ParameterSchema {
  readonly type: ParameterType.STRING;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly enum?: readonly string[];
}

/**
 * Number parameter schema
 */
export interface NumberParameterSchema extends ParameterSchema {
  readonly type: ParameterType.NUMBER;
  readonly min?: number;
  readonly max?: number;
  readonly integer?: boolean;
}

/**
 * Boolean parameter schema
 */
export interface BooleanParameterSchema extends ParameterSchema {
  readonly type: ParameterType.BOOLEAN;
}

/**
 * Object parameter schema
 */
export interface ObjectParameterSchema extends ParameterSchema {
  readonly type: ParameterType.OBJECT;
  readonly properties?: Record<string, AnyParameterSchema>;
  readonly additionalProperties?: boolean;
}

/**
 * Array parameter schema
 */
export interface ArrayParameterSchema extends ParameterSchema {
  readonly type: ParameterType.ARRAY;
  readonly items?: AnyParameterSchema;
  readonly minItems?: number;
  readonly maxItems?: number;
}

/**
 * Any parameter schema
 */
export interface AnyParameterSchema extends ParameterSchema {
  readonly type: ParameterType.ANY;
}

/**
 * Union type for all parameter schemas
 */
export type SchemaDefinition =
  | StringParameterSchema
  | NumberParameterSchema
  | BooleanParameterSchema
  | ObjectParameterSchema
  | ArrayParameterSchema
  | AnyParameterSchema;

/**
 * Validation error
 */
export interface SchemaValidationError {
  readonly path: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * Schema validation result
 */
export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly errors: readonly SchemaValidationError[];
}

/**
 * Schema validator
 */
export class SchemaValidator {
  /**
   * Validate a value against a schema
   */
  static validate(
    value: unknown,
    schema: SchemaDefinition,
    path = '',
  ): SchemaValidationResult {
    const errors: SchemaValidationError[] = [];

    // Check required
    if (schema.required && (value === undefined || value === null)) {
      errors.push({
        path,
        message: 'Value is required',
        value,
      });
      return { valid: false, errors };
    }

    // If value is undefined/null and not required, it's valid
    if (value === undefined || value === null) {
      return { valid: true, errors: [] };
    }

    // Type-specific validation
    switch (schema.type) {
      case ParameterType.STRING:
        errors.push(...this.validateString(value, schema, path));
        break;
      case ParameterType.NUMBER:
        errors.push(...this.validateNumber(value, schema, path));
        break;
      case ParameterType.BOOLEAN:
        errors.push(...this.validateBoolean(value, schema, path));
        break;
      case ParameterType.OBJECT:
        errors.push(...this.validateObject(value, schema, path));
        break;
      case ParameterType.ARRAY:
        errors.push(...this.validateArray(value, schema, path));
        break;
      case ParameterType.ANY:
        // Any type is always valid
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static validateString(
    value: unknown,
    schema: StringParameterSchema,
    path: string,
  ): SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    if (typeof value !== 'string') {
      errors.push({
        path,
        message: 'Value must be a string',
        value,
      });
      return errors;
    }

    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        path,
        message: `String length must be at least ${schema.minLength}`,
        value,
      });
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({
        path,
        message: `String length must be at most ${schema.maxLength}`,
        value,
      });
    }

    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          path,
          message: `String must match pattern ${schema.pattern}`,
          value,
        });
      }
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        path,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        value,
      });
    }

    return errors;
  }

  private static validateNumber(
    value: unknown,
    schema: NumberParameterSchema,
    path: string,
  ): SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors.push({
        path,
        message: 'Value must be a number',
        value,
      });
      return errors;
    }

    if (schema.integer && !Number.isInteger(value)) {
      errors.push({
        path,
        message: 'Value must be an integer',
        value,
      });
    }

    if (schema.min !== undefined && value < schema.min) {
      errors.push({
        path,
        message: `Value must be at least ${schema.min}`,
        value,
      });
    }

    if (schema.max !== undefined && value > schema.max) {
      errors.push({
        path,
        message: `Value must be at most ${schema.max}`,
        value,
      });
    }

    return errors;
  }

  private static validateBoolean(
    value: unknown,
    schema: BooleanParameterSchema,
    path: string,
  ): SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    if (typeof value !== 'boolean') {
      errors.push({
        path,
        message: 'Value must be a boolean',
        value,
      });
    }

    return errors;
  }

  private static validateObject(
    value: unknown,
    schema: ObjectParameterSchema,
    path: string,
  ): SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      errors.push({
        path,
        message: 'Value must be an object',
        value,
      });
      return errors;
    }

    const obj = value as Record<string, unknown>;

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const propPath = path ? `${path}.${key}` : key;
        const result = this.validate(obj[key], propSchema, propPath);
        errors.push(...result.errors);
      }
    }

    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(schema.properties || {}));
      for (const key of Object.keys(obj)) {
        if (!allowedKeys.has(key)) {
          errors.push({
            path: path ? `${path}.${key}` : key,
            message: `Additional property "${key}" is not allowed`,
            value: obj[key],
          });
        }
      }
    }

    return errors;
  }

  private static validateArray(
    value: unknown,
    schema: ArrayParameterSchema,
    path: string,
  ): SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    if (!Array.isArray(value)) {
      errors.push({
        path,
        message: 'Value must be an array',
        value,
      });
      return errors;
    }

    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({
        path,
        message: `Array must have at least ${schema.minItems} items`,
        value,
      });
    }

    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({
        path,
        message: `Array must have at most ${schema.maxItems} items`,
        value,
      });
    }

    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        const itemPath = `${path}[${i}]`;
        const result = this.validate(value[i], schema.items, itemPath);
        errors.push(...result.errors);
      }
    }

    return errors;
  }
}
