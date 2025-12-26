import { type } from "arktype";
import { defineNode } from "@workflow/registry";

export const triggerExecutionNode = defineNode({
	type: "trigger.execution",
	version: 1,
	metadata: {
		name: "Execution Trigger",
		description: "Manually initiates workflow execution",
	},
	inputSchema: {},
	outputSchema: {
		executionStarted: type("string"),
	},
	// biome-ignore lint/suspicious/useAwait: execute function must be async per NodeDefinition interface
	execute: async () => {
		return {
			executionStarted: Date.now().toString(),
		};
	},
});
