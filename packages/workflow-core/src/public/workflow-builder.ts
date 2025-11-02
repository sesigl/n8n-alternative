import type { WorkflowDefinition } from "./types";

interface WorkflowInit {
  name: string;
  version: string;
  description?: string;
}

export class WorkflowBuilder {
  private metadata: WorkflowDefinition["metadata"];

  private constructor(init: WorkflowInit) {
    this.metadata = {
      name: init.name,
      version: init.version,
      createdAt: new Date().toISOString(),
      description: init.description,
    };
  }

  static init(init: WorkflowInit): WorkflowBuilder {
    return new WorkflowBuilder(init);
  }

  build(): WorkflowDefinition {
    return {
      metadata: this.metadata,
      nodes: [],
      edges: [],
      entrypoints: [],
    };
  }
}
