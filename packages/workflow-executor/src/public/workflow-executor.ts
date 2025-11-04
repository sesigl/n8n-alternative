import type { WorkflowDefinition } from "@workflow/core";
import type { NodeRegistry } from "@workflow/registry";
import type { ExecutionResult } from "@/public/types";

export class WorkflowExecutor {
  constructor(private readonly registry: NodeRegistry) {}

  async execute(workflow: WorkflowDefinition): Promise<ExecutionResult> {
    return {
      status: "completed",
    };
  }
}
