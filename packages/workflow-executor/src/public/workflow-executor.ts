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
        // Get the Node instance for validation
        const nodeInstance = this._registry.getNodeInstance(
          step.nodeType,
          step.nodeVersion,
        );

        if (!nodeInstance) {
          throw new Error(
            `Node instance not found: ${step.nodeType}@${step.nodeVersion}`,
          );
        }

        // Validate inputs before execution
        const validatedInputs = nodeInstance.validateInputs(step.inputs);

        // Execute with validated inputs
        const outputs = await step.execute(validatedInputs);

        // Validate outputs after execution
        const validatedOutputs = nodeInstance.validateOutputs(outputs);

        iterator.recordOutput(step.nodeId, validatedOutputs);
        lastOutputs = validatedOutputs;

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
