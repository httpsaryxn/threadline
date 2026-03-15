# ThreadLine

> Internal communication infrastructure that companies embed inside their own websites.

ThreadLine is an embeddable real-time communication platform combining Discord-style roles and channels with Teams-style workspace management — all embedded directly inside your company's website.

## Quick Start

```tsx
import { ThreadLineWidget } from 'threadline-widget';

<ThreadLineWidget
  orgId="org_123"
  apiKey="your_public_api_key"
  adminUsername="admin"
  adminPassword="your_password"
/>
```

## Monorepo Structure

```
threadline/
├── landing/     # Next.js 15 landing site + backend API routes
├── sdk/         # React widget (threadline-widget npm package)
├── database/    # Supabase migrations and schema
├── tests/       # Integration and E2E tests
└── prompt/      # Private (gitignored)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4 |
| Widget SDK | React 19, Vite (lib mode) |
| Database | Supabase (Postgres + Realtime + RLS) |
| Deployment | Vercel |
| Package Manager | Bun |

## License

Apache 2.0 — see [LICENSE](./LICENSE)
