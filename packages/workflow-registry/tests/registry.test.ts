/**
 * Tests for node registry
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  NodeRegistry,
  NodeCategory,
  NodeSpecBuilder,
  ParameterType,
} from '../src/index.js';
import type { WorkflowNode } from '@workflow/core';

describe('NodeRegistry', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  it('should register a node spec', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec);
    assert.equal(registry.has('http-request'), true);
  });

  it('should throw error when registering duplicate type', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec);
    assert.throws(() => registry.register(spec), /already registered/);
  });

  it('should get a registered node spec', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec);
    const retrieved = registry.get('http-request');

    assert.ok(retrieved);
    assert.equal(retrieved.type, 'http-request');
    assert.equal(retrieved.name, 'HTTP Request');
  });

  it('should return undefined for non-existent spec', () => {
    const spec = registry.get('non-existent');
    assert.equal(spec, undefined);
  });

  it('should get all registered specs', () => {
    const spec1 = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    const spec2 = NodeSpecBuilder.create('database-query')
      .setName('Database Query')
      .setDescription('Query databases')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec1);
    registry.register(spec2);

    const all = registry.getAll();
    assert.equal(all.length, 2);
  });

  it('should get specs by category', () => {
    const spec1 = NodeSpecBuilder.create('webhook')
      .setName('Webhook')
      .setDescription('Webhook trigger')
      .setCategory(NodeCategory.TRIGGER)
      .build();

    const spec2 = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec1);
    registry.register(spec2);

    const triggers = registry.getByCategory(NodeCategory.TRIGGER);
    assert.equal(triggers.length, 1);
    assert.equal(triggers[0].type, 'webhook');
  });

  it('should unregister a node spec', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec);
    assert.equal(registry.has('http-request'), true);

    const result = registry.unregister('http-request');
    assert.equal(result, true);
    assert.equal(registry.has('http-request'), false);
  });

  it('should clear all registered specs', () => {
    const spec1 = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    const spec2 = NodeSpecBuilder.create('database-query')
      .setName('Database Query')
      .setDescription('Query databases')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec1);
    registry.register(spec2);

    registry.clear();
    assert.equal(registry.getAll().length, 0);
  });

  it('should validate a workflow node', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .parameter('url', {
        type: ParameterType.STRING,
        required: true,
      })
      .parameter('method', {
        type: ParameterType.STRING,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
      })
      .build();

    registry.register(spec);

    const validNode: WorkflowNode = {
      id: 'node1',
      type: 'http-request',
      name: 'HTTP Request',
      parameters: {
        url: 'https://api.example.com',
        method: 'GET',
      },
    };

    const result = registry.validateNode(validNode);
    assert.equal(result.valid, true);
  });

  it('should detect invalid node type', () => {
    const node: WorkflowNode = {
      id: 'node1',
      type: 'unknown-type',
      name: 'Unknown',
      parameters: {},
    };

    const result = registry.validateNode(node);
    assert.equal(result.valid, false);
    assert.ok(result.errors[0].message.includes('Unknown node type'));
  });

  it('should detect missing required parameters', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .parameter('url', {
        type: ParameterType.STRING,
        required: true,
      })
      .build();

    registry.register(spec);

    const node: WorkflowNode = {
      id: 'node1',
      type: 'http-request',
      name: 'HTTP Request',
      parameters: {},
    };

    const result = registry.validateNode(node);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.message.includes('required')));
  });

  it('should detect unknown parameters', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .parameter('url', {
        type: ParameterType.STRING,
      })
      .build();

    registry.register(spec);

    const node: WorkflowNode = {
      id: 'node1',
      type: 'http-request',
      name: 'HTTP Request',
      parameters: {
        url: 'https://api.example.com',
        unknownParam: 'value',
      },
    };

    const result = registry.validateNode(node);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.message.includes('Unknown parameter')));
  });

  it('should validate multiple nodes', () => {
    const spec = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .parameter('url', {
        type: ParameterType.STRING,
        required: true,
      })
      .build();

    registry.register(spec);

    const nodes: WorkflowNode[] = [
      {
        id: 'node1',
        type: 'http-request',
        name: 'Request 1',
        parameters: { url: 'https://api.example.com' },
      },
      {
        id: 'node2',
        type: 'http-request',
        name: 'Request 2',
        parameters: {}, // Missing required url
      },
    ];

    const result = registry.validateNodes(nodes);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.path.includes('node2')));
  });

  it('should get registry statistics', () => {
    const spec1 = NodeSpecBuilder.create('webhook')
      .setName('Webhook')
      .setDescription('Webhook trigger')
      .setCategory(NodeCategory.TRIGGER)
      .build();

    const spec2 = NodeSpecBuilder.create('http-request')
      .setName('HTTP Request')
      .setDescription('Make HTTP requests')
      .setCategory(NodeCategory.ACTION)
      .build();

    const spec3 = NodeSpecBuilder.create('database-query')
      .setName('Database Query')
      .setDescription('Query databases')
      .setCategory(NodeCategory.ACTION)
      .build();

    registry.register(spec1);
    registry.register(spec2);
    registry.register(spec3);

    const stats = registry.getStats();
    assert.equal(stats.total, 3);
    assert.equal(stats.byCategory[NodeCategory.TRIGGER], 1);
    assert.equal(stats.byCategory[NodeCategory.ACTION], 2);
  });
});
