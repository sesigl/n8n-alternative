import type { UUID } from "../../../public/types/uuid.js";
import type { WorkflowGraph } from "../graph/workflow-graph.js";

export class Entrypoints {
  private constructor(private readonly _entrypoints: UUID[]) {}

  static create(entrypoints: UUID[]): Entrypoints {
    return new Entrypoints([...entrypoints]);
  }

  get entrypoints(): UUID[] {
    return [...this._entrypoints];
  }

  validateAgainstGraph(graph: WorkflowGraph): void {
    for (const entrypointId of this._entrypoints) {
      if (!graph.hasNode(entrypointId)) {
        throw new Error(`Entrypoint references non-existent node: ${entrypointId}`);
      }
    }
  }
}
