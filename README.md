# n8n-alternative

Modern workflow automation platform built with TypeScript, Astro, and Solid.js.

## Tech Stack

- **Monorepo**: pnpm + Turborepo
- **Language**: TypeScript (strict mode)
- **Formatter/Linter**: Biome
- **Frontend**: Astro + Solid.js
- **Runtime**: Node.js

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (managed via Corepack)

## Getting Started

### 1. Set up pnpm via Corepack

This project uses pnpm 9.14.4, managed by Corepack (bundled with Node.js).

First, update Corepack to the latest version to avoid signature verification issues:

```bash
npm install -g corepack@latest
corepack enable
```

Alternatively, prepare the specific pnpm version:

```bash
corepack prepare pnpm@9.14.4 --activate
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run development server

```bash
pnpm dev
```

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm test` - Run tests
- `pnpm check` - Run all checks (pinned versions, linting, type checking)
- `pnpm check:types` - Run TypeScript type checking
- `pnpm check:pinned-versions` - Validate all dependencies use pinned versions
- `pnpm lint` - Check code with Biome
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code with Biome
- `pnpm clean` - Clean all build artifacts

## Project Structure

```
/apps
  ui/                # Main product UI (Astro + Solid.js)

/packages
  (to be added as needed)

/services
  (to be added as needed)
```

## Development

The monorepo uses Turborepo for fast, cached builds and pnpm workspaces for package management.

Each workspace can be run independently or all together using the root scripts.
