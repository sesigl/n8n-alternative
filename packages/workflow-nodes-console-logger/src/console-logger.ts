import type { NodeDefinition } from "@workflow/registry";

export const consoleLoggerNode: NodeDefinition = {
  type: "console.log",
  version: 1,
  metadata: {
    name: "Console Logger",
    description: "Logs messages to the console",
  },
  inputs: {
    message: "string",
  },
  outputs: {
    logged: "string",
  },
  // biome-ignore lint/suspicious/useAwait: execute function must be async per NodeDefinition interface
  execute: async (inputs: Record<string, string>) => {
    const message = inputs.message || "";
    console.log(message);
    return {
      logged: message,
    };
  },
};
