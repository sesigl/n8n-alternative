export class NodeSpec {
  private constructor(
    public readonly type: string,
    public readonly version: number,
  ) {}

  static create(type: string, version: number): NodeSpec {
    if (!type || type.trim().length === 0) {
      throw new Error("NodeSpec type cannot be empty");
    }
    if (version < 1) {
      throw new Error("NodeSpec version must be at least 1");
    }
    return new NodeSpec(type, version);
  }
}
