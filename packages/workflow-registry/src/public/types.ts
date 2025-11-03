export interface NodeMetadata {
  name: string;
  description: string;
}

export interface NodeDefinition {
  type: string;
  metadata: NodeMetadata;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
  execute: (inputs: Record<string, string>) => Promise<Record<string, string>>;
}
