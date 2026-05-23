# DAgendaNG Strapi Platform Design

## Status

Draft for review. No implementation has been started from this document.

## Goal

Move DAgendaNG to a portable CMS/content platform where editorial data, assets, and cache are decoupled from the frontend/backend deployment.

## Decision

Use **Strapi + PostgreSQL + MinIO + Redis** for DAgendaNG.

Keep **Insforge** for other projects where MCP-driven backend generation is the priority. For DAgendaNG, the priority is a human-editable CMS with owner/editor/blogger roles, content workflows, and portable assets.

## Architecture

```txt
Next.js frontend
  ↓ STRAPI_API_URL
Strapi CMS/API
  ↓ DATABASE_URL
PostgreSQL

Strapi Media Library
  ↓ S3-compatible upload provider
MinIO bucket: dagendang-assets

Next.js / optional FastAPI custom services
  ↓ REDIS_URL
Redis
```

## Service naming

Use the `dagendang-*` prefix for all runtime services and containers.

```txt
dagendang-strapi
dagendang-postgres
dagendang-minio
dagendang-redis
```

Recommended logical names:

```txt
Postgres database: dagendang_strapi
Postgres user:     dagendang_user
MinIO bucket:      dagendang-assets
CMS domain:        cms.dagendang.com or strapi.dagendang.com
Assets domain:     assets.dagendang.com
```

## Deployment shape

Create a new deployment folder for the CMS platform, separate from the existing Next/FastAPI app:

```txt
dagendang-platform/
  docker-compose.yml
  .env
  data/
    postgres/
    minio/
    redis/
  strapi/
    Dockerfile
    package.json
    config/
    src/
```

The platform can live in a new repo or as a sibling folder to the current app. It should not require local uploads or a local database inside the Next/FastAPI app.

## Components

### Strapi

Strapi is the CMS and human admin panel.

Responsibilities:

- manage articles/posts;
- manage categories/tags;
- manage authors/editorial metadata;
- manage advertisements/content blocks if needed;
- provide roles and permissions;
- expose REST API for Next.js;
- upload media through the S3 provider to MinIO.

Strapi is a real project that will be created, configured, versioned, and deployed. It is not treated as a generic throwaway image.

### PostgreSQL

Postgres stores Strapi content and configuration.

Responsibilities:

- Strapi content types;
- relations;
- user/role metadata internal to Strapi;
- plugin data.

It should use bind-mounted data for portability:

```txt
./data/postgres:/var/lib/postgresql/data
```

### MinIO

MinIO provides portable S3-compatible asset storage.

Responsibilities:

- store all uploaded images/files from Strapi Media Library;
- expose S3 API internally to Strapi;
- optionally expose public asset URLs through reverse proxy/domain.

It should use bind-mounted data:

```txt
./data/minio:/data
```

Bucket:

```txt
dagendang-assets
```

### Redis

Redis is available for caching and future rate limiting/session/cache needs.

Initial responsibilities:

- provide `REDIS_URL` for app-level caching;
- remain optional for the first Strapi launch unless a Strapi plugin or custom middleware needs it immediately.

It should use bind-mounted data if persistence is enabled:

```txt
./data/redis:/data
```

### Next.js frontend

Next.js becomes a consumer of Strapi content.

Responsibilities:

- fetch published content from `STRAPI_API_URL`;
- render pages/articles;
- use asset URLs from Strapi/MinIO;
- optionally use Redis or Next cache/revalidation to avoid hitting Strapi for every request.

### Existing FastAPI backend

FastAPI should not be the primary CMS after this migration.

Keep it only if it still provides custom logic Strapi should not own, such as:

- economic data scraping;
- AI generation workflows;
- special integrations;
- migration utilities;
- scheduled tasks.

If those features are moved into Strapi, functions, or cron jobs, FastAPI can be removed later.

## Environment contract

### Strapi environment

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
JWT_SECRET=

DATABASE_CLIENT=postgres
DATABASE_HOST=dagendang-postgres
DATABASE_PORT=5432
DATABASE_NAME=dagendang_strapi
DATABASE_USERNAME=dagendang_user
DATABASE_PASSWORD=
DATABASE_SSL=false

S3_ENDPOINT=http://dagendang-minio:9000
S3_PUBLIC_URL=https://assets.dagendang.com
S3_BUCKET=dagendang-assets
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

REDIS_URL=redis://dagendang-redis:6379
```

### Next.js environment

```env
STRAPI_API_URL=https://cms.dagendang.com
STRAPI_API_TOKEN=
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.dagendang.com
REDIS_URL=redis://dagendang-redis:6379
```

Use public env vars only for values safe to expose in the browser.

## Data migration concept

Current source:

```txt
/home/osmarg/Code/diario_project_sanitized_20260519_231735/database/diario_digital_sanitized.sql
/home/osmarg/Code/diario_project_sanitized_20260519_231735/uploads
```

Target:

```txt
Strapi content types + Postgres data
MinIO bucket dagendang-assets
```

Migration phases:

1. define Strapi content types equivalent to current articles/categories/ads;
2. import database content into Strapi through Strapi API or direct controlled scripts;
3. upload files to MinIO through Strapi upload API or S3-compatible client;
4. update media relations in Strapi;
5. verify the frontend reads from Strapi and all images resolve remotely.

## Roles and permissions

Initial roles:

```txt
Owner/Admin: full Strapi admin access.
Editor: manage and publish all editorial content.
Blogger: create/update own posts; publish only if explicitly approved.
Viewer/Client: read-only admin access if needed.
```

Exact Strapi permissions should be configured after content types exist.

## Portability requirement

A server migration should require only:

1. copy platform folder;
2. copy `.env` securely;
3. copy `data/postgres`, `data/minio`, and optionally `data/redis`;
4. run `docker compose up -d`;
5. update DNS/reverse proxy if domains changed.

No manual copying of app-local uploads should be required after the migration.

## Open decisions before implementation

1. CMS domain: `cms.dagendang.com` vs `strapi.dagendang.com`.
2. Assets domain: `assets.dagendang.com` or reuse CMS domain path.
3. Whether FastAPI remains for economic scraping/AI or is phased out.
4. Whether Strapi is kept in the existing repo or a new sibling repo/folder.

## Acceptance criteria

- Strapi runs with Postgres, MinIO, and Redis through Docker Compose.
- Strapi Media Library stores files in MinIO, not local container storage.
- Next.js can fetch published content from Strapi by URL.
- Asset URLs returned to Next.js are network-accessible.
- A fresh app deploy does not require local database files or local uploads.
- Owner/editor/blogger roles can be configured in Strapi.
- Platform data can be backed up by copying `data/postgres` and `data/minio` or by proper database/object-storage backup commands.
