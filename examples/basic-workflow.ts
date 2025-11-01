/**
 * Basic workflow example demonstrating @workflow/core and @workflow/registry
 */

import {
  WorkflowBuilder,
  NodeBuilder,
  WorkflowValidator,
  WorkflowSerializer,
  WorkflowTraversal,
  TraversalOrder,
} from '../packages/workflow-core/dist/index.js';

import {
  NodeRegistry,
  NodeSpecBuilder,
  NodeCategory,
  ParameterType,
} from '../packages/workflow-registry/dist/index.js';

// ===== 1. Setup Node Registry =====
console.log('=== Setting up Node Registry ===\n');

const registry = new NodeRegistry();

// Register a webhook trigger node
const webhookSpec = NodeSpecBuilder.create('webhook')
  .setName('Webhook Trigger')
  .setDescription('Triggers the workflow when a webhook is called')
  .setCategory(NodeCategory.TRIGGER)
  .parameter('path', {
    type: ParameterType.STRING,
    required: true,
    description: 'The webhook path',
  })
  .parameter('method', {
    type: ParameterType.STRING,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    default: 'POST',
  })
  .build();

registry.register(webhookSpec);

// Register an HTTP request node
const httpSpec = NodeSpecBuilder.create('http-request')
  .setName('HTTP Request')
  .setDescription('Makes an HTTP request to an external API')
  .setCategory(NodeCategory.ACTION)
  .parameter('url', {
    type: ParameterType.STRING,
    required: true,
    description: 'The URL to request',
  })
  .parameter('method', {
    type: ParameterType.STRING,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    default: 'GET',
  })
  .parameter('headers', {
    type: ParameterType.OBJECT,
    description: 'Request headers',
  })
  .build();

registry.register(httpSpec);

// Register a data transform node
const transformSpec = NodeSpecBuilder.create('transform')
  .setName('Data Transform')
  .setDescription('Transforms data using JavaScript')
  .setCategory(NodeCategory.TRANSFORM)
  .parameter('code', {
    type: ParameterType.STRING,
    required: true,
    description: 'JavaScript code to transform data',
  })
  .build();

registry.register(transformSpec);

// Register an email output node
const emailSpec = NodeSpecBuilder.create('email')
  .setName('Send Email')
  .setDescription('Sends an email')
  .setCategory(NodeCategory.OUTPUT)
  .parameter('to', {
    type: ParameterType.STRING,
    required: true,
    description: 'Recipient email address',
  })
  .parameter('subject', {
    type: ParameterType.STRING,
    required: true,
    description: 'Email subject',
  })
  .parameter('body', {
    type: ParameterType.STRING,
    required: true,
    description: 'Email body',
  })
  .build();

registry.register(emailSpec);

console.log(`Registered ${registry.getStats().total} node types:`);
for (const [category, count] of Object.entries(registry.getStats().byCategory)) {
  console.log(`  - ${category}: ${count} node(s)`);
}

// ===== 2. Build a Workflow =====
console.log('\n=== Building Workflow ===\n');

const workflow = WorkflowBuilder.create('demo-workflow', 'Demo Workflow')
  .description('A demo workflow showing the workflow engine capabilities')
  .metadata({ author: 'Demo', version: '1.0.0' });

// Add nodes using the fluent API
const trigger = new NodeBuilder('trigger-1', 'webhook')
  .name('Webhook Trigger')
  .parameter('path', '/api/webhook')
  .parameter('method', 'POST')
  .position(100, 100)
  .build();

const httpRequest = new NodeBuilder('http-1', 'http-request')
  .name('Fetch User Data')
  .parameter('url', 'https://api.example.com/users')
  .parameter('method', 'GET')
  .parameter('headers', { 'Content-Type': 'application/json' })
  .position(300, 100)
  .build();

const transform = new NodeBuilder('transform-1', 'transform')
  .name('Process Data')
  .parameter('code', 'return { processedData: input.data };')
  .position(500, 100)
  .build();

const email = new NodeBuilder('email-1', 'email')
  .name('Send Notification')
  .parameter('to', 'admin@example.com')
  .parameter('subject', 'New Data Received')
  .parameter('body', 'Data has been processed successfully')
  .position(700, 100)
  .build();

// Add nodes to workflow
workflow
  .addNode(trigger)
  .addNode(httpRequest)
  .addNode(transform)
  .addNode(email);

// Connect nodes
workflow
  .connect('trigger-1', 'http-1')
  .connect('http-1', 'transform-1')
  .connect('transform-1', 'email-1');

const builtWorkflow = workflow.build();

console.log('Workflow created:');
console.log(`  Name: ${builtWorkflow.name}`);
console.log(`  Nodes: ${builtWorkflow.nodes.length}`);
console.log(`  Connections: ${builtWorkflow.connections.length}`);

// ===== 3. Validate Workflow Structure =====
console.log('\n=== Validating Workflow Structure ===\n');

const structureValidation = WorkflowValidator.validate(builtWorkflow);

if (structureValidation.valid) {
  console.log('✓ Workflow structure is valid');
} else {
  console.log('✗ Workflow structure validation failed:');
  for (const error of structureValidation.errors) {
    console.log(`  - ${error.message}`);
  }
}

// ===== 4. Validate Node Parameters =====
console.log('\n=== Validating Node Parameters ===\n');

const nodeValidation = registry.validateNodes(builtWorkflow.nodes);

if (nodeValidation.valid) {
  console.log('✓ All node parameters are valid');
} else {
  console.log('✗ Node parameter validation failed:');
  for (const error of nodeValidation.errors) {
    console.log(`  - ${error.path}: ${error.message}`);
  }
}

// ===== 5. Serialize Workflow =====
console.log('\n=== Serializing Workflow ===\n');

const json = WorkflowSerializer.toJSON(builtWorkflow, { pretty: true });
console.log('Workflow JSON (first 500 chars):');
console.log(json.substring(0, 500) + '...');

// Deserialize and verify
const deserialized = WorkflowSerializer.fromJSON(json);
console.log('\n✓ Workflow successfully serialized and deserialized');
console.log(`  Original nodes: ${builtWorkflow.nodes.length}`);
console.log(`  Deserialized nodes: ${deserialized.nodes.length}`);

// ===== 6. Traverse Workflow =====
console.log('\n=== Traversing Workflow ===\n');

console.log('Depth-first traversal:');
WorkflowTraversal.traverse(
  builtWorkflow,
  'trigger-1',
  (node, depth) => {
    console.log(`  ${'  '.repeat(depth)}→ ${node.name} (${node.type})`);
  },
  TraversalOrder.DEPTH_FIRST,
);

// ===== 7. Analyze Workflow =====
console.log('\n=== Workflow Analysis ===\n');

const rootNodes = WorkflowTraversal.findRootNodes(builtWorkflow);
const leafNodes = WorkflowTraversal.findLeafNodes(builtWorkflow);

console.log(`Root nodes (${rootNodes.length}):`);
for (const node of rootNodes) {
  console.log(`  - ${node.name}`);
}

console.log(`\nLeaf nodes (${leafNodes.length}):`);
for (const node of leafNodes) {
  console.log(`  - ${node.name}`);
}

// ===== Summary =====
console.log('\n=== Summary ===\n');
console.log('✓ Successfully demonstrated:');
console.log('  1. Node type registration with schemas');
console.log('  2. Workflow building with fluent API');
console.log('  3. Workflow structure validation');
console.log('  4. Node parameter validation');
console.log('  5. Workflow serialization/deserialization');
console.log('  6. Workflow traversal');
console.log('  7. Workflow analysis');
console.log('\nAll features working correctly! 🎉');
