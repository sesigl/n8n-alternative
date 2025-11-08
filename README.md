# n8n-alternative

<img src="https://raw.githubusercontent.com/sesigl/n8n-alternative/gh-pages/badges/coverage.svg?raw=true" alt="Coverage" />

Modern workflow automation platform built with TypeScript, Astro, and Solid.js.

## Tech Stack

- **Monorepo**: pnpm
- **Language**: TypeScript (strict mode)
- **Formatter/Linter**: Biome
- **Frontend**: Astro + Solid.js
- **Runtime**: Node.js

## Prerequisites

- Node.js (latest LTS recommended)
- pnpm (managed via Corepack)

## Getting Started

### 1. Set up pnpm via Corepack

This project uses pnpm, managed by Corepack (bundled with Node.js).

```bash
corepack enable
pnpm install
```

### 2. Run development server

```bash
pnpm dev
```

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm test` - Run tests
- `pnpm test:coverage` - Run tests with coverage reports
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

The monorepo uses pnpm and typescript project references for task execution and package management.

Each workspace can be run independently or all together using the root scripts.
