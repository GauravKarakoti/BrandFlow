# BrandFlow

An autonomous AI agent and SaaS application that contextually generates and schedules LinkedIn posts using a personalized brand knowledge base.

## Run & Operate

- `pnpm run dev:api` — run the API server (port 5000)
- `pnpm run dev:frontend` — run the Vite frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm run db:push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Postgres), `GROQ_API_KEY` (AI generation), and social OAuth credentials (LinkedIn).

## Stack

- Workspace: pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React, Vite, Tailwind CSS, shadcn/ui, React Query, Wouter
- API: Express 5, `node-cron` (for autonomous workers)
- DB: PostgreSQL + Drizzle ORM (`@workspace/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- AI: Groq SDK
- Auth: LinkedIn OAuth (JWT via localStorage/Headers)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/frontend/`: The React web application and UI components.
- `artifacts/api-server/`: The Express backend, housing the API routes and background workers (`src/workers/agent.ts` and `src/workers/publisher.ts`).
- `lib/db/`: The database source-of-truth, including the Drizzle schema definitions and migrations.
- `lib/api-spec/` & `lib/api-client-react/`: OpenAPI configuration and auto-generated data fetching hooks.

## Architecture decisions

- Autonomous Agent Pivot: Evolved from a manual prompt-and-publish workflow into a fully autonomous system where a daily background worker evaluates user schedules and generates content without human intervention.
- Optimistic Locking for Publishing: The minute-by-minute publisher worker utilizes an optimistic lock (`status = 'publishing'`) on database rows to safely prevent duplicate postings when running multiple server instances.
- Context-Injected Zero-Shot Generation: The Groq-powered AI pipeline bypasses LangChain entirely, relying instead on highly structured, zero-shot system prompts populated dynamically by the user's `brandKnowledgeBase` and `agentSettings`.

## Product

- Brand Knowledge Base: Users can define their company identity, target audience, tone of voice, upload brand assets, and provide external links to train their specific agent.
- Agent Configuration: Users can toggle "Autopilot" ON/OFF, define their core content pillars, and set a specific target for weekly posts via an intuitive React dashboard.
- Autonomous Generation: Once Autopilot is active, a daily background cron job automatically drafts highly contextual posts and queues them into the database as `scheduled`.
- Automated Publishing: A separate, high-frequency cron job scans the database for due posts and publishes them directly to connected social accounts via their respective APIs.

## User preferences

- Strictly maintain TypeScript across the entire stack (no plain JavaScript files).
- Exclusively use PostgreSQL and Drizzle ORM (no MongoDB implementations).
- Rely solely on Groq for LLM capabilities (no GPT-4o or LangChain integration).

## Gotchas

- Token Expirations: LinkedIn access tokens expire after 60 days. X (Twitter) tokens expire every 2 hours and require aggressive programmatic refreshing via the publisher worker.
- Worker Initialization: Both the `agentWorker` and `publisherWorker` must be explicitly initialized in the backend entry file (`index.ts`) for scheduled operations to run.
- Database Schema Syncing: Always ensure the `projectId` type constraint (string/PgUUID) matches exactly across `projects`, `posts`, and `agentSettings` before pushing Drizzle schema updates.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
