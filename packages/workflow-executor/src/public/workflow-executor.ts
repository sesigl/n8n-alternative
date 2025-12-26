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
        // Get the Node instance
        const nodeInstance = this._registry.getNodeInstance(
          step.nodeType,
          step.nodeVersion,
        );

        if (!nodeInstance) {
          throw new Error(
            `Node instance not found: ${step.nodeType}@${step.nodeVersion}`,
          );
        }

        // Execute node (validation happens automatically inside execute)
        const outputs = await nodeInstance.execute(step.inputs);

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
