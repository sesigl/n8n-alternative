# Workflow Engine Examples

This directory contains examples demonstrating the usage of `@workflow/core` and `@workflow/registry` packages.

## Running the Examples

### Prerequisites

Make sure you have built the packages first:

```bash
# From the repository root
pnpm build
```

### Basic Workflow Example

The `basic-workflow.ts` example demonstrates:

1. **Node Type Registration** - Registering custom node types with validation schemas
2. **Workflow Building** - Creating workflows using the fluent builder API
3. **Validation** - Validating workflow structure and node parameters
4. **Serialization** - Converting workflows to/from JSON
5. **Traversal** - Walking through workflow nodes in different orders
6. **Analysis** - Finding root and leaf nodes

Run the example:

```bash
# From the repository root
pnpm tsx examples/basic-workflow.ts
```

## Example Output

The basic workflow example creates a simple workflow with 4 nodes:

```
Webhook Trigger → HTTP Request → Data Transform → Send Email
```

It then validates the workflow, serializes it to JSON, and demonstrates various traversal and analysis operations.
