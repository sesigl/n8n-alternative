export class WorkflowMetadata {
  private constructor(
    public readonly name: string,
    public readonly version: string,
    public readonly createdAt: string,
    public readonly description?: string,
  ) {}

  static create(
    name: string,
    version: string,
    createdAt: string,
    description?: string,
  ): WorkflowMetadata {
    if (!name || name.trim().length === 0) {
      throw new Error("WorkflowMetadata name cannot be empty");
    }
    if (!version || version.trim().length === 0) {
      throw new Error("WorkflowMetadata version cannot be empty");
    }
    if (!createdAt || createdAt.trim().length === 0) {
      throw new Error("WorkflowMetadata createdAt cannot be empty");
    }
    return new WorkflowMetadata(name, version, createdAt, description);
  }
}
