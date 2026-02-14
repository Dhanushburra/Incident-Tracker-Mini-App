# Incident Tracker App

### Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Pydantic
- **Frontend**: React, TypeScript, Vite, React Router, React Query

---

### Setup

#### Prerequisites
* **Docker & Docker Compose**: Ensure Docker Desktop or the Docker engine is running.

#### Quick Start (Docker)
The fastest way to spin up the entire stack (Postgres, FastAPI, and React):

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd incident-tracker

2. **Run command in project root terminal**:
   ```bash
   docker compose up --build

### API Overview

- `POST /api/incidents`
  - Create a new incident with validation.
- `GET /api/incidents`
  - List incidents using **cursor-based server-side pagination**:
    - Query params:
      - `limit` (default 20, max 100)
      - `cursor` (optional opaque string)
      - `search`, `severity`, `status`, `service` (optional filters)
    - Response:
      - `{ items: Incident[], nextCursor: string | null, hasMore: boolean }`
    - Sorted by `created_at DESC, id DESC` with keyset pagination, stable under concurrent writes.
- `GET /api/incidents/{id}`
  - Fetch incident details.
- `PATCH /api/incidents/{id}`
  - Partially update an incident (status, owner, summary, etc.).


### Design Decisions & Tradeoffs

- **Cursor-based pagination**:
  - Uses keyset pagination on `(created_at, id)` for stable ordering as new incidents arrive.
  - Simpler UX: sequential Next/Previous rather than arbitrary page numbers.
  - Tradeoff: no direct "go to page N" navigation, which is acceptable for a live incident feed.
- **Indexes for each filter**:
  - Current filters include severity, status, service, general search
  - Indexes have been added for fields severity, status, service which leads to super fast fetching of filter results
  - Tradeoff: Supports faster reads but writing becomes slow as many indexes need to be updated and indexes consume more RAM 
- **FastAPI + Postgres**:
  - Strong typing and validation via Pydantic.
  - Easy to extend with more endpoints, auth, and middleware.
- **React Query + URL-based state**:
  - Server is the source of truth for data; caching and refetching are handled for user on frontend.
  - Filters, limit, and cursor live in the URL, making views shareable and back/forward-friendly.

### Possible Improvements With More Time

- Add authentication and per-user ownership/assignment of incidents.
- Add more sophisticated seeding and fixtures, plus automated tests.
- Expand filtering and sorting options (e.g., multiple services, date ranges) and support per-sort cursor pagination.
- Better visual design with a component library and richer loading/skeleton states.

