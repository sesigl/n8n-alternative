import { generateUUID } from "../internal/uuid";
import type { Edge, EdgeEndpoint, Node, NodeSpec, Port, UUID, WorkflowDefinition } from "./types";

interface WorkflowInit {
  name: string;
  version: string;
  description?: string;
}

interface AddNodeInput {
  spec: NodeSpec;
  config: Record<string, unknown>;
  ports: {
    inputs: Array<{ name: string }>;
    outputs: Array<{ name: string }>;
  };
}

interface ConnectInput {
  source: EdgeEndpoint;
  target: EdgeEndpoint;
}

export class WorkflowBuilder {
  private metadata: WorkflowDefinition["metadata"];
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private entrypoints: UUID[] = [];

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

  addNode(input: AddNodeInput): UUID {
    const nodeId = generateUUID();

    const inputs: Port[] = input.ports.inputs.map((port) => ({
      id: generateUUID(),
      name: port.name,
    }));

    const outputs: Port[] = input.ports.outputs.map((port) => ({
      id: generateUUID(),
      name: port.name,
    }));

    const node: Node = {
      id: nodeId,
      spec: input.spec,
      config: input.config,
      ports: {
        inputs,
        outputs,
      },
    };

    this.nodes.push(node);

    return nodeId;
  }

  connect(input: ConnectInput): UUID {
    const edgeId = generateUUID();

    const edge: Edge = {
      id: edgeId,
      source: input.source,
      target: input.target,
    };

    this.edges.push(edge);

    return edgeId;
  }

  setEntrypoints(nodeIds: UUID[]): void {
    this.entrypoints = nodeIds;
  }

  build(options?: { validate?: boolean }): WorkflowDefinition {
    const workflow: WorkflowDefinition = {
      metadata: this.metadata,
      nodes: this.nodes,
      edges: this.edges,
      entrypoints: this.entrypoints,
    };

    if (options?.validate) {
      this.validateWorkflow(workflow);
    }

    return workflow;
  }

  private validateWorkflow(workflow: WorkflowDefinition): void {
    this.validateShape(workflow);
    this.detectCycles(workflow);
  }

  private validateShape(workflow: WorkflowDefinition): void {
    const nodeIds = new Set(workflow.nodes.map((node) => node.id));

    for (const entrypointId of workflow.entrypoints) {
      if (!nodeIds.has(entrypointId)) {
        throw new Error(`Entrypoint references non-existent node: ${entrypointId}`);
      }
    }

    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source.nodeId)) {
        throw new Error(`Edge references non-existent source node: ${edge.source.nodeId}`);
      }
      if (!nodeIds.has(edge.target.nodeId)) {
        throw new Error(`Edge references non-existent target node: ${edge.target.nodeId}`);
      }
    }
  }

  private detectCycles(workflow: WorkflowDefinition): void {
    const adjacencyMap = new Map<UUID, UUID[]>();

    for (const node of workflow.nodes) {
      adjacencyMap.set(node.id, []);
    }

    for (const edge of workflow.edges) {
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

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          throw new Error("Cycle detected in workflow");
        }
      }
    }
  }
}
