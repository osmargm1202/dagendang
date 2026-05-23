# DAgendaNG Strapi Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portable DAgendaNG CMS platform using Strapi, PostgreSQL, MinIO, and Redis, with clear service names and environment-based integration points for the existing Next.js/FastAPI app.

**Architecture:** Strapi owns CMS/admin/content APIs, PostgreSQL stores Strapi data, MinIO stores Strapi media through S3-compatible APIs, and Redis is available for cache. Next.js later consumes Strapi via `STRAPI_API_URL` and does not depend on local uploads or local DB.

**Tech Stack:** Strapi 5, Node.js, Docker Compose, PostgreSQL, MinIO, Redis, S3-compatible Strapi upload provider, Next.js.

---

## Scope

This plan prepares the platform. It does not yet migrate DAgendaNG content or rewrite the existing frontend/backend.

## File structure

Create a new folder, preferably outside the current app until validated:

```txt
/home/osmarg/Code/dagendang-platform/
  docker-compose.yml
  .env.example
  .env
  strapi/
    Dockerfile
    package.json
    package-lock.json or yarn.lock/pnpm-lock.yaml
    config/
    src/
  data/
    postgres/
    minio/
    redis/
```

Responsibilities:

- `docker-compose.yml`: runtime orchestration for the CMS platform.
- `.env.example`: safe documented template.
- `.env`: local secrets; never commit.
- `strapi/`: versioned Strapi project.
- `data/`: bind-mounted runtime state; do not commit.

## Task 1: Create platform folder and env template

**Files:**

- Create: `/home/osmarg/Code/dagendang-platform/.env.example`
- Create: `/home/osmarg/Code/dagendang-platform/.gitignore`
- Create directories: `/home/osmarg/Code/dagendang-platform/data/postgres`, `/home/osmarg/Code/dagendang-platform/data/minio`, `/home/osmarg/Code/dagendang-platform/data/redis`

- [ ] **Step 1: Create directories**

Run:

```bash
mkdir -p /home/osmarg/Code/dagendang-platform/data/postgres
mkdir -p /home/osmarg/Code/dagendang-platform/data/minio
mkdir -p /home/osmarg/Code/dagendang-platform/data/redis
mkdir -p /home/osmarg/Code/dagendang-platform/strapi
```

Expected: directories exist.

- [ ] **Step 2: Write `.gitignore`**

Create `/home/osmarg/Code/dagendang-platform/.gitignore`:

```gitignore
.env
data/
node_modules/
.tmp/
.cache/
build/
dist/
.strapi/
.DS_Store
```

- [ ] **Step 3: Write `.env.example`**

Create `/home/osmarg/Code/dagendang-platform/.env.example`:

```env
COMPOSE_PROJECT_NAME=dagendang

# Public service ports
STRAPI_PORT=1337
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
POSTGRES_PORT=5432
REDIS_PORT=6379

# Strapi secrets: generate unique random values before production
HOST=0.0.0.0
PORT=1337
APP_KEYS=change-me-key-1,change-me-key-2,change-me-key-3,change-me-key-4
API_TOKEN_SALT=change-me-api-token-salt
ADMIN_JWT_SECRET=change-me-admin-jwt-secret
TRANSFER_TOKEN_SALT=change-me-transfer-token-salt
JWT_SECRET=change-me-jwt-secret

# PostgreSQL
POSTGRES_DB=dagendang_strapi
POSTGRES_USER=dagendang_user
POSTGRES_PASSWORD=change-me-postgres-password
DATABASE_CLIENT=postgres
DATABASE_HOST=dagendang-postgres
DATABASE_PORT=5432
DATABASE_NAME=dagendang_strapi
DATABASE_USERNAME=dagendang_user
DATABASE_PASSWORD=change-me-postgres-password
DATABASE_SSL=false

# MinIO / S3-compatible storage
MINIO_ROOT_USER=dagendang_minio
MINIO_ROOT_PASSWORD=change-me-minio-root-password
S3_ENDPOINT=http://dagendang-minio:9000
S3_PUBLIC_URL=http://localhost:9000
S3_BUCKET=dagendang-assets
S3_ACCESS_KEY=dagendang_minio
S3_SECRET_KEY=change-me-minio-root-password
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# Redis
REDIS_URL=redis://dagendang-redis:6379
```

- [ ] **Step 4: Copy `.env.example` to `.env`**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform
cp .env.example .env
```

Expected: `.env` exists and is ignored by git.

## Task 2: Create Docker Compose runtime

**Files:**

- Create: `/home/osmarg/Code/dagendang-platform/docker-compose.yml`

- [ ] **Step 1: Write initial compose file**

Create `/home/osmarg/Code/dagendang-platform/docker-compose.yml`:

```yaml
services:
  dagendang-postgres:
    image: postgres:16-alpine
    container_name: dagendang-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-dagendang_strapi}
      POSTGRES_USER: ${POSTGRES_USER:-dagendang_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U ${POSTGRES_USER:-dagendang_user} -d ${POSTGRES_DB:-dagendang_strapi}",
        ]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dagendang-network

  dagendang-minio:
    image: minio/minio:latest
    container_name: dagendang-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}
    volumes:
      - ./data/minio:/data
    ports:
      - "${MINIO_API_PORT:-9000}:9000"
      - "${MINIO_CONSOLE_PORT:-9001}:9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dagendang-network

  dagendang-minio-init:
    image: minio/mc:latest
    container_name: dagendang-minio-init
    depends_on:
      dagendang-minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://dagendang-minio:9000 $${MINIO_ROOT_USER} $${MINIO_ROOT_PASSWORD};
      mc mb --ignore-existing local/$${S3_BUCKET};
      mc anonymous set download local/$${S3_BUCKET};
      echo bucket-ready;
      "
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}
      S3_BUCKET: ${S3_BUCKET:-dagendang-assets}
    networks:
      - dagendang-network
    restart: "no"

  dagendang-redis:
    image: redis:7-alpine
    container_name: dagendang-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - ./data/redis:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dagendang-network

  dagendang-strapi:
    build:
      context: ./strapi
      dockerfile: Dockerfile
    container_name: dagendang-strapi
    restart: unless-stopped
    env_file:
      - .env
    environment:
      NODE_ENV: production
      DATABASE_CLIENT: postgres
      DATABASE_HOST: dagendang-postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: ${DATABASE_NAME:-dagendang_strapi}
      DATABASE_USERNAME: ${DATABASE_USERNAME:-dagendang_user}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD:?DATABASE_PASSWORD is required}
      DATABASE_SSL: ${DATABASE_SSL:-false}
      REDIS_URL: ${REDIS_URL:-redis://dagendang-redis:6379}
    ports:
      - "${STRAPI_PORT:-1337}:1337"
    depends_on:
      dagendang-postgres:
        condition: service_healthy
      dagendang-minio:
        condition: service_healthy
      dagendang-redis:
        condition: service_healthy
    networks:
      - dagendang-network

networks:
  dagendang-network:
    name: dagendang-network
    driver: bridge
```

- [ ] **Step 2: Validate compose syntax**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform
docker compose config >/tmp/dagendang-platform-compose.yml
```

Expected: command exits successfully.

## Task 3: Create Strapi project

**Files:**

- Populate: `/home/osmarg/Code/dagendang-platform/strapi/`

- [ ] **Step 1: Scaffold Strapi 5 project**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform
npx create-strapi-app@latest strapi --no-run --typescript --dbclient=postgres --dbhost=dagendang-postgres --dbport=5432 --dbname=dagendang_strapi --dbusername=dagendang_user --dbpassword=change-me-postgres-password
```

Expected: `strapi/package.json`, `strapi/config`, and `strapi/src` exist.

- [ ] **Step 2: Install S3 upload provider**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform/strapi
npm install @strapi/provider-upload-aws-s3
```

Expected: package is added to `strapi/package.json`.

## Task 4: Configure Strapi database and S3 provider

**Files:**

- Modify: `/home/osmarg/Code/dagendang-platform/strapi/config/database.ts`
- Create/modify: `/home/osmarg/Code/dagendang-platform/strapi/config/plugins.ts`
- Create: `/home/osmarg/Code/dagendang-platform/strapi/Dockerfile`

- [ ] **Step 1: Configure database from env**

Ensure `strapi/config/database.ts` contains equivalent logic:

```ts
export default ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "dagendang-postgres"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "dagendang_strapi"),
      user: env("DATABASE_USERNAME", "dagendang_user"),
      password: env("DATABASE_PASSWORD"),
      ssl: env.bool("DATABASE_SSL", false),
    },
    pool: {
      min: env.int("DATABASE_POOL_MIN", 2),
      max: env.int("DATABASE_POOL_MAX", 10),
    },
  },
});
```

- [ ] **Step 2: Configure S3 upload provider**

Create or update `strapi/config/plugins.ts`:

```ts
export default ({ env }) => ({
  upload: {
    config: {
      provider: "aws-s3",
      providerOptions: {
        baseUrl: env("S3_PUBLIC_URL"),
        rootPath: env("S3_BUCKET", "dagendang-assets"),
        s3Options: {
          credentials: {
            accessKeyId: env("S3_ACCESS_KEY"),
            secretAccessKey: env("S3_SECRET_KEY"),
          },
          endpoint: env("S3_ENDPOINT"),
          region: env("S3_REGION", "us-east-1"),
          forcePathStyle: env.bool("S3_FORCE_PATH_STYLE", true),
          params: {
            Bucket: env("S3_BUCKET", "dagendang-assets"),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

- [ ] **Step 3: Create Strapi Dockerfile**

Create `strapi/Dockerfile`:

```Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 1337
CMD ["npm", "run", "start"]
```

- [ ] **Step 4: Validate Strapi TypeScript/config**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform/strapi
npm run build
```

Expected: build completes without config/type errors.

## Task 5: Launch platform locally/LAN

**Files:**

- Use: `/home/osmarg/Code/dagendang-platform/docker-compose.yml`
- Use: `/home/osmarg/Code/dagendang-platform/.env`

- [ ] **Step 1: Start dependencies first**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform
docker compose up -d dagendang-postgres dagendang-minio dagendang-redis dagendang-minio-init
```

Expected:

```txt
dagendang-postgres healthy
dagendang-minio healthy
dagendang-redis healthy
dagendang-minio-init exited 0
```

- [ ] **Step 2: Start Strapi**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform
docker compose up -d --build dagendang-strapi
```

Expected: `dagendang-strapi` is running.

- [ ] **Step 3: Verify HTTP**

Run:

```bash
curl -fsS -o /dev/null -w 'strapi:%{http_code}\n' http://127.0.0.1:1337/admin
curl -fsS -o /dev/null -w 'minio:%{http_code}\n' http://127.0.0.1:9001
```

Expected:

```txt
strapi:200
minio:200
```

## Task 6: Create first Strapi admin and roles

**Files:**

- No code changes required.

- [ ] **Step 1: Open Strapi admin**

Open:

```txt
http://localhost:1337/admin
```

Create the first admin user.

- [ ] **Step 2: Create editorial roles**

In Strapi Admin, configure roles:

```txt
Owner/Admin: full access
Editor: create/update/publish all content
Blogger: create/update own posts; publish only if approved
Viewer: read-only if needed
```

Expected: users can be assigned to the intended roles.

## Task 7: Create initial content model draft

**Files:**

- Strapi will generate files under `strapi/src/api/*`.

- [ ] **Step 1: Create Article collection type**

Fields:

```txt
title: text, required
slug: uid from title, required
summary: text
content: rich text or blocks
coverImage: media, single
category: relation to Category
publishedAt: Strapi draft/publish field
authorName: text
isPremium: boolean default false
seoTitle: text
seoDescription: text
```

- [ ] **Step 2: Create Category collection type**

Fields:

```txt
name: text, required
slug: uid from name, required
description: text
```

- [ ] **Step 3: Create Advertisement collection type**

Fields:

```txt
title: text, required
image: media, single
linkUrl: text
position: enumeration header, sidebar_top, sidebar_bottom, inline
isActive: boolean default true
rotationSeconds: integer default 5
```

- [ ] **Step 4: Save and let Strapi restart**

Expected: generated API folders exist under `strapi/src/api`.

## Task 8: Verify MinIO media upload

**Files:**

- No code changes unless upload provider config is wrong.

- [ ] **Step 1: Upload an image in Strapi Media Library**

Upload a small test image.

Expected: upload succeeds.

- [ ] **Step 2: Verify object exists in MinIO**

Open MinIO console:

```txt
http://localhost:9001
```

Expected: the image appears in bucket `dagendang-assets`.

- [ ] **Step 3: Verify public URL**

Copy the image URL returned by Strapi and open it in a browser.

Expected: image loads without needing local `uploads/`.

## Task 9: Prepare Next.js integration contract

**Files:**

- Create: `/home/osmarg/Code/dagendang-platform/docs/next-integration.md`

- [ ] **Step 1: Document required frontend env**

Create `docs/next-integration.md`:

````md
# Next.js Integration Contract

Required environment variables:

```env
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=<created in Strapi admin>
NEXT_PUBLIC_ASSET_BASE_URL=http://localhost:9000/dagendang-assets
REDIS_URL=redis://dagendang-redis:6379
```
````

Rules:

- Next.js fetches content from Strapi, not from the old FastAPI article endpoints.
- Next.js renders media URLs returned by Strapi.
- Next.js must not require a local `uploads/` directory.
- Redis is optional for first render path but available for caching.

````

- [ ] **Step 2: Review the contract**

Expected: user confirms whether FastAPI remains for custom endpoints.

## Task 10: Backup and portability verification

**Files:**
- No code changes.

- [ ] **Step 1: Stop platform**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform
docker compose down
````

Expected: containers stop; `data/` remains.

- [ ] **Step 2: Restart platform**

Run:

```bash
cd /home/osmarg/Code/dagendang-platform
docker compose up -d
```

Expected: Strapi content, uploaded media, and MinIO bucket persist.

- [ ] **Step 3: Document backup command**

Recommended backup paths:

```txt
/home/osmarg/Code/dagendang-platform/data/postgres
/home/osmarg/Code/dagendang-platform/data/minio
/home/osmarg/Code/dagendang-platform/.env
/home/osmarg/Code/dagendang-platform/strapi
```

Expected: migration to another server is a copy of project + data + env, then `docker compose up -d`.

## Self-review

- Spec coverage: covers Strapi, Postgres, MinIO, Redis, naming, portability, roles, and Next integration.
- Placeholder scan: no implementation placeholders remain; secret values are intentionally marked as change-me values in `.env.example`.
- Type consistency: service names and env names are consistent across design and plan.
- Scope: platform setup only; content migration and frontend rewrite are intentionally separate follow-up plans.
