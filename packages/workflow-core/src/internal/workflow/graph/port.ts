import type { UUID } from "@/public/types/uuid";

export class Port {
  private constructor(
    public readonly id: UUID,
    public readonly name: string,
  ) {}

  static create(id: UUID, name: string): Port {
    if (!id || id.trim().length === 0) {
      throw new Error("Port id cannot be empty");
    }
    if (!name || name.trim().length === 0) {
      throw new Error("Port name cannot be empty");
    }
    return new Port(id, name);
  }

  equals(other: Port): boolean {
    return this.id === other.id && this.name === other.name;
  }

  toString(): string {
    return `Port(${this.name})`;
  }
}
