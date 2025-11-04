import type { WorkflowDefinition } from "@workflow/core";
import type { NodeRegistry } from "@workflow/registry";
import type { ExecutionResult } from "@/public/types";

export class WorkflowExecutor {
  constructor(readonly _registry: NodeRegistry) {}

  execute(_workflow: WorkflowDefinition): ExecutionResult {
    return {
      status: "completed",
    };
  }
}
