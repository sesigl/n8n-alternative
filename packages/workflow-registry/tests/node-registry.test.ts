import { type } from "arktype";
import { beforeEach, describe, expect, it } from "vitest";
import { NodeRegistry } from "../src/public/node-registry.js";

describe("NodeRegistry", () => {
	let registry: NodeRegistry;

	beforeEach(() => {
		registry = new NodeRegistry();
	});

	describe("registerNode", () => {
		it("should register a node type successfully", () => {
			const nodeDefinition = {
				type: "console.log",
				version: 1,
				metadata: {
					name: "Console Logger",
					description: "Logs messages to console",
				},
				inputSchema: {
					message: type("string"),
				},
				outputSchema: {
					logged: type("string"),
				},
				// biome-ignore lint/suspicious/useAwait: Just an example without await
				execute: async (inputs: { message: string }) => {
					const message = inputs.message || "";
					console.log(message);
					return { logged: message };
				},
			};

			const registerAction = () => registry.registerNode(nodeDefinition);

			expect(registerAction).not.toThrow();
		});

		it("should reject invalid node type names", () => {
			const nodeDefinition = {
				type: "console-log",
				version: 1,
				metadata: {
					name: "Console Logger",
					description: "Logs messages to console",
				},
				inputSchema: {},
				outputSchema: {},
				execute: async () => ({}),
			};

			expect(() => registry.registerNode(nodeDefinition)).toThrow(
				"Invalid node type name",
			);
		});

		it("should prevent duplicate node type registrations", () => {
			const nodeDefinition = {
				type: "console.log",
				version: 1,
				metadata: {
					name: "Console Logger",
					description: "Logs messages to console",
				},
				inputSchema: { message: type("string") },
				outputSchema: { logged: type("string") },
				execute: async (inputs: { message: string }) => ({
					logged: inputs.message || "",
				}),
			};
			registry.registerNode(nodeDefinition);

			expect(() => registry.registerNode(nodeDefinition)).toThrow(
				"Node type console.log@1 is already registered",
			);
		});
	});

	describe("listNodeTypes", () => {
		it("should list all registered node types", () => {
			registry.registerNode({
				type: "console.log",
				version: 1,
				metadata: { name: "Console Logger", description: "Logs to console" },
				inputSchema: { message: type("string") },
				outputSchema: { logged: type("string") },
				execute: async (inputs: { message: string }) => ({
					logged: inputs.message || "",
				}),
			});

			registry.registerNode({
				type: "trigger.execution",
				version: 1,
				metadata: {
					name: "Execution Trigger",
					description: "Triggers execution",
				},
				inputSchema: {},
				outputSchema: { context: type("string") },
				execute: async () => ({ context: "triggered" }),
			});

			const nodeTypes = registry.listNodeTypes();

			expect(nodeTypes).toEqual(["console.log@1", "trigger.execution@1"]);
		});

		it("should return empty array when no nodes registered", () => {
			const nodeTypes = registry.listNodeTypes();

			expect(nodeTypes).toEqual([]);
		});
	});

	describe("getNode", () => {
		it("should retrieve a registered node by type and version", () => {
			const nodeDefinition = {
				type: "console.log",
				version: 1,
				metadata: { name: "Console Logger", description: "Logs to console" },
				inputSchema: { message: type("string") },
				outputSchema: { logged: type("string") },
				execute: async (inputs: { message: string }) => ({
					logged: inputs.message || "",
				}),
			};
			registry.registerNode(nodeDefinition);

			const retrievedNode = registry.getNode("console.log", 1);

			expect(retrievedNode).toBeDefined();
			expect(retrievedNode?.type).toBe("console.log");
			expect(retrievedNode?.version).toBe(1);
			expect(retrievedNode?.metadata.name).toBe("Console Logger");
			expect(retrievedNode?.metadata.description).toBe("Logs to console");
			expect(retrievedNode?.inputSchema).toBeDefined();
			expect(retrievedNode?.outputSchema).toBeDefined();
			expect(retrievedNode?.execute).toBeDefined();
		});

		it("should return undefined for non-existent node type", () => {
			const node = registry.getNode("non.existent", 1);

			expect(node).toBeUndefined();
		});
	});
});
