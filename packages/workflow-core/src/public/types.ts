export type UUID = string;

// Value Object: NodeSpec
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

  equals(other: NodeSpec): boolean {
    return this.type === other.type && this.version === other.version;
  }

  toString(): string {
    return `${this.type}@v${this.version}`;
  }
}

// Value Object: Port
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

// Value Object: EdgeEndpoint
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

  equals(other: EdgeEndpoint): boolean {
    return this.nodeId === other.nodeId && this.portId === other.portId;
  }

  toString(): string {
    return `${this.nodeId}:${this.portId}`;
  }
}

// Value Object: WorkflowMetadata
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

  withDescription(description: string): WorkflowMetadata {
    return new WorkflowMetadata(this.name, this.version, this.createdAt, description);
  }

  toString(): string {
    return `${this.name} v${this.version}`;
  }
}

// Value Object: ValidationResult
export class ValidationResult {
  private constructor(
    public readonly valid: boolean,
    public readonly errors?: string[],
  ) {}

  static success(): ValidationResult {
    return new ValidationResult(true);
  }

  static failure(errors: string[]): ValidationResult {
    if (errors.length === 0) {
      throw new Error("Failure ValidationResult must have at least one error");
    }
    return new ValidationResult(false, errors);
  }

  isValid(): boolean {
    return this.valid;
  }

  hasErrors(): boolean {
    return !this.valid && this.errors !== undefined && this.errors.length > 0;
  }

  getErrors(): string[] {
    return this.errors || [];
  }

  toString(): string {
    if (this.valid) {
      return "ValidationResult: SUCCESS";
    }
    return `ValidationResult: FAILURE - ${this.errors?.join(", ")}`;
  }
}

// Entity: Node
export class Node {
  private constructor(
    public readonly id: UUID,
    public readonly spec: NodeSpec,
    public readonly config: Record<string, unknown>,
    private readonly _ports: {
      inputs: Port[];
      outputs: Port[];
    },
  ) {}

  static create(
    id: UUID,
    spec: NodeSpec,
    config: Record<string, unknown>,
    ports: {
      inputs: Port[];
      outputs: Port[];
    },
  ): Node {
    if (!id || id.trim().length === 0) {
      throw new Error("Node id cannot be empty");
    }
    return new Node(id, spec, config, ports);
  }

  static createWithPortNames(
    id: UUID,
    spec: NodeSpec,
    config: Record<string, unknown>,
    portNames: {
      inputs: string[];
      outputs: string[];
    },
    generateId: () => UUID,
  ): Node {
    const inputs = portNames.inputs.map((name) => Port.create(generateId(), name));
    const outputs = portNames.outputs.map((name) => Port.create(generateId(), name));

    return Node.create(id, spec, config, { inputs, outputs });
  }

  get ports(): { inputs: Port[]; outputs: Port[] } {
    return {
      inputs: [...this._ports.inputs],
      outputs: [...this._ports.outputs],
    };
  }

  hasInputPort(portId: UUID): boolean {
    return this._ports.inputs.some((port) => port.id === portId);
  }

  hasOutputPort(portId: UUID): boolean {
    return this._ports.outputs.some((port) => port.id === portId);
  }

  findPort(portId: UUID): Port | undefined {
    return (
      this._ports.inputs.find((p) => p.id === portId) ||
      this._ports.outputs.find((p) => p.id === portId)
    );
  }

  equals(other: Node): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `Node(${this.id}, ${this.spec.toString()})`;
  }
}

// Entity: Edge
export class Edge {
  private constructor(
    public readonly id: UUID,
    public readonly source: EdgeEndpoint,
    public readonly target: EdgeEndpoint,
  ) {}

  static create(id: UUID, source: EdgeEndpoint, target: EdgeEndpoint): Edge {
    if (!id || id.trim().length === 0) {
      throw new Error("Edge id cannot be empty");
    }
    if (source.nodeId === target.nodeId && source.portId === target.portId) {
      throw new Error("Edge cannot connect a port to itself");
    }
    return new Edge(id, source, target);
  }

  connectsNodes(sourceNodeId: UUID, targetNodeId: UUID): boolean {
    return this.source.nodeId === sourceNodeId && this.target.nodeId === targetNodeId;
  }

  equals(other: Edge): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `Edge(${this.source.toString()} -> ${this.target.toString()})`;
  }
}

// Entity/Aggregate Root: WorkflowDefinition
export class WorkflowDefinition {
  private constructor(
    public readonly metadata: WorkflowMetadata,
    private readonly _nodes: Node[],
    private readonly _edges: Edge[],
    private readonly _entrypoints: UUID[],
  ) {}

  static create(
    metadata: WorkflowMetadata,
    nodes: Node[],
    edges: Edge[],
    entrypoints: UUID[],
  ): WorkflowDefinition {
    return new WorkflowDefinition(metadata, nodes, edges, entrypoints);
  }

  get nodes(): Node[] {
    return [...this._nodes];
  }

  get edges(): Edge[] {
    return [...this._edges];
  }

  get entrypoints(): UUID[] {
    return [...this._entrypoints];
  }

  findNode(nodeId: UUID): Node | undefined {
    return this._nodes.find((node) => node.id === nodeId);
  }

  hasNode(nodeId: UUID): boolean {
    return this._nodes.some((node) => node.id === nodeId);
  }

  findEdge(edgeId: UUID): Edge | undefined {
    return this._edges.find((edge) => edge.id === edgeId);
  }

  getIncomingEdges(nodeId: UUID): Edge[] {
    return this._edges.filter((edge) => edge.target.nodeId === nodeId);
  }

  getOutgoingEdges(nodeId: UUID): Edge[] {
    return this._edges.filter((edge) => edge.source.nodeId === nodeId);
  }

  isEntrypoint(nodeId: UUID): boolean {
    return this._entrypoints.includes(nodeId);
  }

  validate(): void {
    this.validateShape();
    this.detectCycles();
  }

  private validateShape(): void {
    for (const entrypointId of this._entrypoints) {
      if (!this.hasNode(entrypointId)) {
        throw new Error(`Entrypoint references non-existent node: ${entrypointId}`);
      }
    }

    for (const edge of this._edges) {
      if (!this.hasNode(edge.source.nodeId)) {
        throw new Error(`Edge references non-existent source node: ${edge.source.nodeId}`);
      }
      if (!this.hasNode(edge.target.nodeId)) {
        throw new Error(`Edge references non-existent target node: ${edge.target.nodeId}`);
      }
    }
  }

  private detectCycles(): void {
    const adjacencyMap = new Map<UUID, UUID[]>();

    for (const node of this._nodes) {
      adjacencyMap.set(node.id, []);
    }

    for (const edge of this._edges) {
      const targets = adjacencyMap.get(edge.source.nodeId);
      if (targets) {
        targets.push(edge.target.nodeId);
      }
    }

    const visited = new Set<UUID>();
    const recursionStack = new Set<UUID>();

    const hasCycle = (nodeId: UUID): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjacencyMap.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of this._nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          throw new Error("Cycle detected in workflow");
        }
      }
    }
  }

  toString(): string {
    return `WorkflowDefinition(${this.metadata.toString()}, ${this._nodes.length} nodes, ${this._edges.length} edges)`;
  }
}

// Interface for Registry (service contract - stays as interface)
export interface Registry {
  has(spec: NodeSpec): boolean;
  validate(spec: NodeSpec, config: Record<string, unknown>): ValidationResult;
}
