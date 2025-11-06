export interface ExecutionResult {
  status: "completed" | "failed";
  outputs?: Record<string, unknown>;
  error?: Error;
}

export interface NodeExecutionEvent {
  type: "started" | "completed" | "failed";
  nodeId: string;
  timestamp: string;
  data?: unknown;
  error?: Error;
}
