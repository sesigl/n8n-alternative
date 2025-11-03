const NODE_TYPE_NAME_PATTERN = /^[a-z]+\.[a-z]+@\d+$/;

export class NodeType {
  private readonly value: string;

  constructor(typeName: string) {
    if (!NODE_TYPE_NAME_PATTERN.test(typeName)) {
      throw new Error(
        `Invalid node type name: ${typeName}. Expected format: namespace.action@version (e.g., "console.log@1")`,
      );
    }
    this.value = typeName;
  }

  toString(): string {
    return this.value;
  }

  equals(other: NodeType): boolean {
    return this.value === other.value;
  }
}
