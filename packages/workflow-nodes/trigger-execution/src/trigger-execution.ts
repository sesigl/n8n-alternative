import type { NodeDefinition } from "@workflow/registry";

export const triggerExecutionNode: NodeDefinition = {
  type: "trigger.execution@1",
  metadata: {
    name: "Execution Trigger",
    description: "Manually initiates workflow execution",
  },
  inputs: {},
  outputs: {
    executionStarted: "number",
  },
  // biome-ignore lint/suspicious/useAwait: execute function must be async per NodeDefinition interface
  execute: async () => {
    return {
      executionStarted: Date.now().toString(),
    };
  },
};
