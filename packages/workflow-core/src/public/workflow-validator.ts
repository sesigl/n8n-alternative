import type { WorkflowDefinition } from "./types";

export class WorkflowValidator {
  validate(workflow: WorkflowDefinition): void {
    workflow.validate();
  }
}
