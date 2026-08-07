# BrandFlow

An autonomous AI agent and SaaS application that contextually generates and schedules LinkedIn posts using a personalized brand knowledge base.

# Overview

BrandFlow is an AI Social Media Manager designed to automate LinkedIn content creation for businesses, startups, creators, and professionals.

Instead of manually writing and publishing posts, users configure their brand identity, audience, content pillars, and posting schedule. BrandFlow's autonomous AI agent then generates contextual LinkedIn posts using Groq AI and automatically publishes them at scheduled times.

The platform combines AI-driven content generation, PostgreSQL-powered data management, and automated publishing workers to provide a complete social media automation solution.

---

## Run & Operate

- `pnpm run dev:api` — run the API server (port 5000)
- `pnpm run dev:frontend` — run the Vite frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm run db:push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Postgres), `GROQ_API_KEY` (AI generation), and social OAuth credentials (LinkedIn).


# Features

- 🤖 AI-powered LinkedIn post generation
- 📅 Automatic post scheduling
- 🚀 Autonomous publishing using background workers
- 🧠 Personalized Brand Knowledge Base
- 🎯 Custom content pillars and posting frequency
- 🔗 LinkedIn OAuth authentication
- ⚡ Groq LLM integration for contextual content creation
- 📊 User dashboard for agent configuration
- 🔒 Type-safe API using TypeScript and Zod
- 🗄️ PostgreSQL database with Drizzle ORM

---

# Project Structure

```text
BrandFlow
│
├── artifacts/
│   ├── frontend/            # React frontend
│   └── api-server/          # Express backend
│       └── workers/
│           ├── agent.ts
│           └── publisher.ts
│
├── lib/
│   ├── db/                  # Database schema & migrations
│   ├── api-spec/            # OpenAPI specification
│   └── api-client-react/    # Generated React API hooks
│
└── package.json
```

---

# Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/GauravKarakoti/BrandFlow.git
cd BrandFlow
```
## 2. Install Dependencies

```bash
pnpm install
```
## 3. Configure Environment Variables

Copy .env.example to .env:
```bash
cp .env.example .env
```

## 4. Push Database Schema

```bash
pnpm run db:push
```

## 5. Start Development Servers

Backend

```bash
pnpm run dev:api
```
Frontend

```bash
pnpm run dev:frontend
```

---

## Tech Stack

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

# Technical Workflow

```text
             User
               │
               ▼
        React Frontend
               │
               ▼
        Express API Server
               │
      ┌────────┴─────────┐
      ▼                  ▼
 Brand Knowledge      Agent Settings
      │                  │
      └────────┬─────────┘
               ▼
        Groq AI Generation
               │
               ▼
      Scheduled Posts (PostgreSQL)
               │
               ▼
     Publisher Worker (Cron Job)
               │
               ▼
      LinkedIn Publishing API
               │
               ▼
     Published LinkedIn Post
```

---

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
