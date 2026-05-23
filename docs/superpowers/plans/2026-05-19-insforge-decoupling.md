# Insforge Decoupling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple DAgendaNG frontend/backend deployment from local Postgres and local uploads by using a self-hosted Insforge instance as the central Postgres and asset service.

**Architecture:** Insforge runs as an independent Docker Compose stack on `osmarg@10.0.0.13` under `~/insforge`, with bind-mounted `data/` and `assets/` directories. The app backend later consumes Insforge/Postgres/storage through environment variables, so the frontend/backend can be deployed anywhere without carrying database or upload files.

**Tech Stack:** Docker Compose, Insforge OSS, Insforge Postgres image, PostgREST, Deno runtime, FastAPI backend, Next.js frontend, PostgreSQL, remote asset storage.

---

## Phase 0: Boundaries and safety

- Do not start Insforge until the user explicitly approves `docker compose up -d`.
- Do not migrate the DAgendaNG app yet.
- Do not import the sanitized SQL dump yet.
- Do not copy uploads into Insforge yet.
- First deliverable is only the remote `~/insforge/docker-compose.yml` and `~/insforge/.env` template.
- `.env` must contain placeholders only; the user will fill secrets, domains, project values, and URLs.

## Phase 1: Create remote Insforge deployment scaffold

**Remote path:** `/home/osmarg/insforge`

**Files:**

- Create: `/home/osmarg/insforge/docker-compose.yml`
- Create: `/home/osmarg/insforge/.env`
- Create directories:
  - `/home/osmarg/insforge/data/postgres`
  - `/home/osmarg/insforge/data/deno_cache`
  - `/home/osmarg/insforge/data/logs`
  - `/home/osmarg/insforge/assets/storage`

**Design decisions:**

- Use the current Insforge self-hosted Docker images from the official deployment compose:
  - `ghcr.io/insforge/postgres-all:latest`
  - `postgrest/postgrest:v12.2.12`
  - `ghcr.io/insforge/insforge-oss:v1.5.0`
  - `ghcr.io/insforge/deno-runtime:latest`
- Use bind mounts instead of anonymous Docker volumes so backups are visible in the `insforge/` folder.
- Use internal network `insforge-internal` for service-to-service traffic.
- Attach the public Insforge service to external network `nginx-proxy-network` for reverse proxy integration.
- Keep Postgres bound to `127.0.0.1` by default via `.env` to avoid accidental public DB exposure. Change only after deciding secure network access.

**Verification commands, no service startup:**

```bash
ssh osmarg@10.0.0.13 'cd ~/insforge && docker compose config >/tmp/insforge-compose.rendered.yml && echo compose-ok'
ssh osmarg@10.0.0.13 'test -d ~/insforge/data/postgres && test -d ~/insforge/assets/storage && echo dirs-ok'
ssh osmarg@10.0.0.13 'docker network inspect nginx-proxy-network >/dev/null && echo proxy-network-ok || echo proxy-network-missing'
```

Expected:

- `compose-ok`
- `dirs-ok`
- `proxy-network-ok` if the reverse-proxy network already exists. If missing, create it only after user approval:

```bash
docker network create nginx-proxy-network
```

## Phase 2: User fills Insforge `.env`

The user fills at minimum:

```env
POSTGRES_PASSWORD=<strong-password>
JWT_SECRET=<32+ char secret>
ENCRYPTION_KEY=<32+ char secret>
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<strong admin password>
API_BASE_URL=https://<insforge-api-domain>
VITE_API_BASE_URL=https://<insforge-api-domain>
```

Optional later values:

```env
OPENROUTER_API_KEY=
STRIPE_LIVE_SECRET_KEY=
STRIPE_TEST_SECRET_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## Phase 3: Launch Insforge after approval

Run only after user says to launch:

```bash
ssh osmarg@10.0.0.13 'cd ~/insforge && docker compose pull && docker compose up -d'
```

Verify:

```bash
ssh osmarg@10.0.0.13 'cd ~/insforge && docker compose ps'
ssh osmarg@10.0.0.13 'curl -fsS http://127.0.0.1:7130 >/dev/null && echo app-http-ok'
ssh osmarg@10.0.0.13 'curl -fsS http://127.0.0.1:7133/health && echo deno-health-ok'
```

Expected:

- `postgres`, `postgrest`, `insforge`, and `deno` are running.
- Local HTTP health checks succeed.

## Phase 4: User configures Insforge and exports project links

User logs into Insforge and records:

```txt
INSFORGE_API_URL=
INSFORGE_PROJECT_ID=
INSFORGE_STORAGE_BUCKET=
INSFORGE_SERVICE_ROLE_KEY=
INSFORGE_ANON_KEY=
INSFORGE_DATABASE_URL=
INSFORGE_PUBLIC_ASSET_BASE_URL=
```

Do not proceed with app code until these values exist.

## Phase 5: Prepare DAgendaNG app migration

**Backend files expected to change later:**

- `backend/app/db/database.py` — keep `DATABASE_URL` as the only DB source.
- `backend/app/api/upload.py` — replace local filesystem write with storage provider upload.
- Create `backend/app/services/storage.py` — provider abstraction for Insforge asset upload.
- `backend/requirements.txt` — add HTTP/client dependency only if the Insforge API requires it beyond existing `httpx`.
- `backend/app/main.py` — remove or disable local `/uploads` StaticFiles in production.

**Frontend files expected to change later:**

- `frontend/next.config.ts` — allow remote image host via `images.remotePatterns`.
- Any image rendering code that assumes `/uploads/...` is same-origin.

**Environment expected later:**

```env
DATABASE_URL=<Insforge Postgres URL>
STORAGE_PROVIDER=insforge
STORAGE_API_URL=<Insforge API URL>
STORAGE_BUCKET=<bucket>
STORAGE_SERVICE_KEY=<service key>
STORAGE_PUBLIC_BASE_URL=<public asset URL>
NEXT_PUBLIC_API_URL=<backend URL or /api behind proxy>
NEXT_PUBLIC_ASSET_BASE_URL=<public asset URL>
```

## Phase 6: Migrate sanitized backup

Inputs:

- SQL dump: `/home/osmarg/Code/diario_project_sanitized_20260519_231735/database/diario_digital_sanitized.sql`
- Uploads: `/home/osmarg/Code/diario_project_sanitized_20260519_231735/uploads`

Process:

1. Import SQL into the chosen Insforge/Postgres project database.
2. Upload all files from `uploads/` to the Insforge asset bucket.
3. Rewrite DB values from `/uploads/<file>` to `https://<asset-domain>/<bucket>/<file>`.
4. Report missing referenced assets and unreferenced files.

Known backup facts:

- SQL references 60 `/uploads/...` URLs.
- Local `uploads/` has 116 files.
- One referenced path appears external/WordPress-style and is missing locally.
- 57 local files are not referenced by SQL.

## Phase 7: App verification after migration

Run backend checks:

```bash
cd backend
python -m pytest -q
```

If no tests exist or pytest is unavailable, run at minimum:

```bash
python -m compileall app
```

Run frontend checks:

```bash
cd frontend
bun run lint
bun run build
```

Manual smoke checks:

- Homepage loads articles from remote DB.
- Article images load from remote asset URLs.
- Admin upload creates remote asset, not local file.
- Fresh deploy without local `uploads/` still works.
- Fresh deploy without local Postgres still works.

## Phase 8: Cleanup once stable

Remove production dependency on:

- local `db` Docker service in the DAgendaNG app compose;
- `./uploads:/app/uploads` bind mount in production compose;
- Next `/uploads` rewrite if no longer needed;
- FastAPI `StaticFiles(directory="uploads")` in production.

Keep optional local-only dev compose if desired.
