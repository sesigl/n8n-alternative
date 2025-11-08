import type { WorkflowDefinition } from "@workflow/core";
import type { NodeRegistry } from "@workflow/registry";
import type { ExecutionResult } from "./types.js";

export class WorkflowExecutor {
  constructor(readonly _registry: NodeRegistry) {}

  async execute(workflow: WorkflowDefinition): Promise<ExecutionResult> {
    try {
      const iterator = workflow.createIterator();
      let lastOutputs: Record<string, string> | undefined;

      let step = iterator.getNextStep();
      while (step !== null) {
        const inputsAsStrings: Record<string, string> = {};
        for (const [key, value] of Object.entries(step.inputs)) {
          inputsAsStrings[key] = String(value);
        }

        const outputs = await step.execute(inputsAsStrings);
        iterator.recordOutput(step.nodeId, outputs);
        lastOutputs = outputs;

        step = iterator.getNextStep();
      }

      return {
        status: "completed",
        outputs: lastOutputs,
      };
    } catch (error) {
      return {
        status: "failed",
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
