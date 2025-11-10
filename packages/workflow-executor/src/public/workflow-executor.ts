import type { WorkflowDefinition } from "@workflow/core";
import type { NodeRegistry } from "@workflow/registry";
import type { ExecutionResult } from "./types.js";

export class WorkflowExecutor {
  constructor(readonly _registry: NodeRegistry) {}

  async execute(workflow: WorkflowDefinition): Promise<ExecutionResult> {
    try {
      const iterator = workflow.createIterator();
      let lastOutputs: Record<string, unknown> | undefined;

      let step = iterator.getNextStep();
      while (step !== null) {
        // Pass inputs as-is without converting to strings
        // ArkType will handle validation at the node level
        const outputs = await step.execute(step.inputs);
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
