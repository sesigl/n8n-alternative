import type { WorkflowDefinition } from "./domain/workflow/workflow-definition";

export class WorkflowValidator {
  validate(workflow: WorkflowDefinition): void {
    workflow.validate();
  }
}
