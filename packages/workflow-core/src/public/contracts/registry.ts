import type { NodeSpec } from "../domain/workflow/node-spec";
import type { ValidationResult } from "../domain/workflow/validation-result";

export interface Registry {
  has(spec: NodeSpec): boolean;
  validate(spec: NodeSpec, config: Record<string, unknown>): ValidationResult;
}
