import { type } from "arktype";
import { defineNode } from "@workflow/registry";

export const consoleLoggerNode = defineNode({
	type: "console.log",
	version: 1,
	metadata: {
		name: "Console Logger",
		description: "Logs messages to the console",
	},
	inputSchema: {
		message: type("string"),
	},
	outputSchema: {
		logged: type("string"),
	},
	// biome-ignore lint/suspicious/useAwait: execute function must be async per NodeDefinition interface
	execute: async (inputs) => {
		const message = inputs.message || "";
		console.log(message);
		return {
			logged: message,
		};
	},
});
