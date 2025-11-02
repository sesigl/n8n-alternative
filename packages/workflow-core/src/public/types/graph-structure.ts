export interface SimpleNode {
  id: string;
  type: string;
}

export interface SimpleEdge {
  from: string;
  to: string;
}

export interface GraphStructure {
  nodes: SimpleNode[];
  edges: SimpleEdge[];
  entrypoints: string[];
}
