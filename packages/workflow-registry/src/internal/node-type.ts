const NODE_TYPE_NAME_PATTERN = /^[a-z]+\.[a-z]+$/;

export class NodeType {
  private readonly typeName: string;
  private readonly version: number;

  constructor(typeName: string, version: number) {
    if (!NODE_TYPE_NAME_PATTERN.test(typeName)) {
      throw new Error(
        `Invalid node type name: ${typeName}. Expected format: namespace.action (e.g., "console.log")`,
      );
    }
    this.typeName = typeName;
    this.version = version;
  }

  toString(): string {
    return `${this.typeName}@${this.version}`;
  }

  equals(other: NodeType): boolean {
    return this.typeName === other.typeName && this.version === other.version;
  }
}
