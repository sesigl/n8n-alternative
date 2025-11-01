/**
 * Node type registry implementation
 */

import type { WorkflowNode } from '@workflow/core';
import type { NodeSpec } from './node-spec.js';
import type { SchemaValidationResult } from './schema.js';
import { SchemaValidator } from './schema.js';

/**
 * Registry for node type specifications
 */
export class NodeRegistry {
  private specs: Map<string, NodeSpec>;

  constructor() {
    this.specs = new Map();
  }

  /**
   * Register a node type specification
   */
  register(spec: NodeSpec): void {
    if (this.specs.has(spec.type)) {
      throw new Error(`Node type ${spec.type} is already registered`);
    }
    this.specs.set(spec.type, spec);
  }

  /**
   * Register multiple node type specifications
   */
  registerMany(specs: NodeSpec[]): void {
    for (const spec of specs) {
      this.register(spec);
    }
  }

  /**
   * Get a node type specification
   */
  get(type: string): NodeSpec | undefined {
    return this.specs.get(type);
  }

  /**
   * Check if a node type is registered
   */
  has(type: string): boolean {
    return this.specs.has(type);
  }

  /**
   * Get all registered node types
   */
  getAll(): NodeSpec[] {
    return Array.from(this.specs.values());
  }

  /**
   * Get all node types in a specific category
   */
  getByCategory(category: string): NodeSpec[] {
    return this.getAll().filter((spec) => spec.category === category);
  }

  /**
   * Unregister a node type
   */
  unregister(type: string): boolean {
    return this.specs.delete(type);
  }

  /**
   * Clear all registered node types
   */
  clear(): void {
    this.specs.clear();
  }

  /**
   * Validate a workflow node against its specification
   */
  validateNode(node: WorkflowNode): SchemaValidationResult {
    const spec = this.get(node.type);

    if (!spec) {
      return {
        valid: false,
        errors: [
          {
            path: 'type',
            message: `Unknown node type: ${node.type}`,
            value: node.type,
          },
        ],
      };
    }

    const errors: Array<{
      path: string;
      message: string;
      value?: unknown;
    }> = [];

    // Validate each parameter
    for (const [paramName, paramSchema] of Object.entries(spec.parameters)) {
      const paramValue = node.parameters[paramName];
      const result = SchemaValidator.validate(
        paramValue,
        paramSchema,
        `parameters.${paramName}`,
      );
      errors.push(...result.errors);
    }

    // Check for unknown parameters
    for (const paramName of Object.keys(node.parameters)) {
      if (!spec.parameters[paramName]) {
        errors.push({
          path: `parameters.${paramName}`,
          message: `Unknown parameter: ${paramName}`,
          value: node.parameters[paramName],
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate multiple workflow nodes
   */
  validateNodes(nodes: WorkflowNode[]): SchemaValidationResult {
    const allErrors: Array<{
      path: string;
      message: string;
      value?: unknown;
    }> = [];

    for (const node of nodes) {
      const result = this.validateNode(node);
      // Prefix errors with node id
      for (const error of result.errors) {
        allErrors.push({
          ...error,
          path: `node[${node.id}].${error.path}`,
        });
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Get statistics about registered nodes
   */
  getStats(): {
    total: number;
    byCategory: Record<string, number>;
  } {
    const stats = {
      total: this.specs.size,
      byCategory: {} as Record<string, number>,
    };

    for (const spec of this.specs.values()) {
      const category = spec.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Global default registry instance
 */
export const defaultRegistry = new NodeRegistry();
