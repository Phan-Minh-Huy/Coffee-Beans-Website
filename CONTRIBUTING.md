# Contributing

- Create a `feature/<topic>` or `fix/<topic>` branch from main.
- Keep server and browser secrets separated; never commit `.env.local`.
- Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Update migrations, tests, documentation and `.env.example` when functionality changes.
- Review security boundaries for each new database table or route handler.
- Prefer small, readable components and actionable error messages.
- Production deployment and destructive database migrations require operator approval.
