import type { UUID } from "@/public/types/uuid";

export class EdgeEndpoint {
  private constructor(
    public readonly nodeId: UUID,
    public readonly portId: UUID,
  ) {}

  static create(nodeId: UUID, portId: UUID): EdgeEndpoint {
    if (!nodeId || nodeId.trim().length === 0) {
      throw new Error("EdgeEndpoint nodeId cannot be empty");
    }
    if (!portId || portId.trim().length === 0) {
      throw new Error("EdgeEndpoint portId cannot be empty");
    }
    return new EdgeEndpoint(nodeId, portId);
  }
}
