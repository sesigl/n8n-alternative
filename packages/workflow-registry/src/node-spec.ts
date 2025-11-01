/**
 * Node type specifications
 */

import type { SchemaDefinition } from './schema.js';

/**
 * Node category for organization
 */
export enum NodeCategory {
  TRIGGER = 'trigger',
  ACTION = 'action',
  TRANSFORM = 'transform',
  CONTROL = 'control',
  OUTPUT = 'output',
}

/**
 * Input/Output specification
 */
export interface IOSpec {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
  readonly required?: boolean;
}

/**
 * Node type specification
 */
export interface NodeSpec {
  readonly type: string;
  readonly name: string;
  readonly description: string;
  readonly category: NodeCategory;
  readonly version: number;
  readonly inputs?: readonly IOSpec[];
  readonly outputs?: readonly IOSpec[];
  readonly parameters: Record<string, SchemaDefinition>;
  readonly icon?: string;
  readonly color?: string;
}

/**
 * Node specification builder
 */
export class NodeSpecBuilder {
  private type: string;
  private name: string;
  private description: string;
  private category: NodeCategory;
  private version: number;
  private inputs?: readonly IOSpec[];
  private outputs?: readonly IOSpec[];
  private parameters: Record<string, SchemaDefinition>;
  private icon?: string;
  private color?: string;

  constructor(type: string) {
    this.type = type;
    this.name = type;
    this.description = '';
    this.category = NodeCategory.ACTION;
    this.version = 1;
    this.parameters = {};
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  setCategory(category: NodeCategory): this {
    this.category = category;
    return this;
  }

  setVersion(version: number): this {
    this.version = version;
    return this;
  }

  setInputs(inputs: readonly IOSpec[]): this {
    this.inputs = inputs;
    return this;
  }

  setOutputs(outputs: readonly IOSpec[]): this {
    this.outputs = outputs;
    return this;
  }

  setParameters(parameters: Record<string, SchemaDefinition>): this {
    this.parameters = parameters;
    return this;
  }

  parameter(name: string, schema: SchemaDefinition): this {
    this.parameters = {
      ...this.parameters,
      [name]: schema,
    };
    return this;
  }

  setIcon(icon: string): this {
    this.icon = icon;
    return this;
  }

  setColor(color: string): this {
    this.color = color;
    return this;
  }

  build(): NodeSpec {
    if (!this.type || !this.name || !this.description) {
      throw new Error('NodeSpec must have type, name, and description');
    }

    return {
      type: this.type,
      name: this.name,
      description: this.description,
      category: this.category,
      version: this.version,
      inputs: this.inputs,
      outputs: this.outputs,
      parameters: this.parameters,
      icon: this.icon,
      color: this.color,
    };
  }

  static create(type: string): NodeSpecBuilder {
    return new NodeSpecBuilder(type);
  }
}
