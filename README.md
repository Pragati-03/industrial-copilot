# AI for Industrial Knowledge Intelligence — Unified Asset & Operations Brain

Phase 1 scaffold: project structure, routing, and theme only. No business
logic has been implemented yet — every screen and endpoint below is a
placeholder confirming the wiring works end-to-end.

## Structure

```
.
├── backend/                 FastAPI + SQLite API
│   ├── app/
│   │   ├── main.py           App entry point (CORS, router mounting)
│   │   ├── core/config.py    Environment-driven settings
│   │   ├── db/                SQLAlchemy engine, session, declarative base
│   │   ├── api/v1/router.py  Versioned API router (aggregation point)
│   │   ├── models/            ORM models (empty — Phase 2)
│   │   └── schemas/           Pydantic schemas (empty — Phase 2)
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 React + Vite + TypeScript
    ├── src/
    │   ├── components/ui/     shadcn/ui primitives (button, card, separator)
    │   ├── components/layout/ Sidebar, Topbar, AppShell, PagePlaceholder
    │   ├── pages/              One placeholder page per platform module
    │   ├── routes/index.tsx   Centralized route definitions
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css           Industrial blue-gray theme tokens
    ├── tailwind.config.ts
    ├── components.json         shadcn/ui CLI config
    └── package.json
```

## Backend setup

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API available at `http://127.0.0.1:8000`, health check at `/` and `/api/v1/ping`.
SQLite database file is created automatically on first run per `DATABASE_URL`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App available at `http://127.0.0.1:5173`.

## Adding more shadcn/ui components

This scaffold hand-includes `button`, `card`, and `separator`. To add more
via the official CLI once you have network access in your own environment:

```bash
npx shadcn@latest add <component-name>
```

## Theme

The "industrial blue-gray" theme lives entirely in `frontend/src/index.css`
as HSL CSS variables (`--primary`, `--sidebar`, `--status-safe`, etc.),
consumed by `tailwind.config.ts`. Both light and dark variants are defined.

## Next phases

- Phase 2: data models, schemas, and CRUD endpoints for documents and assets
- Phase 3: document ingestion pipeline (OCR, NLP, entity extraction)
- Phase 4: knowledge graph layer
- Phase 5: RAG-based copilot and maintenance/RCA agent
