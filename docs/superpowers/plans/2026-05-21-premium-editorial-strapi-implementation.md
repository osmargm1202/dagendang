# Premium Editorial Strapi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Google Stitch premium editorial redesign using real Strapi content/assets for articles, Tony D. Reyes daily opinion, Reto Diario poll, and rotating ads.

**Architecture:** Add a server-only Strapi data layer, normalize Strapi v5 responses into frontend-friendly models, then restyle public UI components around the Stitch 12-column editorial layout. Keep existing FastAPI/admin/auth behavior where still active, and route protected poll voting through a Next.js API route so tokens never reach the browser.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, next-themes, Strapi v5 REST API, existing FastAPI ad/auth/admin routes.

---

## Source documents

- Design spec: `docs/superpowers/specs/2026-05-21-premium-editorial-redesign-design.md`
- Stitch design system: `design/design_base.md`
- Stitch homepage: `design/portada_light_mode.md`, `design/portada_dark_mode.md`
- Stitch article: `design/noticia_light_mode.md`, `design/noticia_dark_mode.md`
- Strapi API guide: `design/api.md`

## File structure

Create:

- `frontend/src/app/lib/strapi.ts` — server-only Strapi fetch helper, media URL helper, Strapi response utilities.
- `frontend/src/app/lib/content.ts` — normalized content types and fetchers for site setting, categories, articles, daily opinions, personalities, polls, price board items.
- `frontend/src/app/api/polls/[documentId]/vote/route.ts` — internal protected poll vote proxy.
- `frontend/src/app/components/DailyChallengeCard.tsx` — client poll/Reto Diario card with voting UI.
- `frontend/src/app/components/TonyColumnCard.tsx` — server-safe Tony D. Reyes / daily opinion card.

Modify:

- `frontend/src/app/globals.css` — Stitch tokens mapped to CSS variables/Tailwind theme.
- `frontend/src/app/layout.tsx` — preserve fonts/theme, no broad behavior change.
- `frontend/src/app/components/SiteHeader.tsx` — premium sticky editorial header, real Strapi categories where provided by parent/client fetch remains fallback.
- `frontend/src/app/components/SiteFooter.tsx` — Stitch footer styling.
- `frontend/src/app/components/AdBanner.tsx` — richer placeholders, contact text, rotation count, new positions/dimensions.
- `frontend/src/app/components/NewsGrid.tsx` — accept normalized Strapi articles and restyle cards.
- `frontend/src/app/page.tsx` — fetch real Strapi homepage data and render 12-column layout.
- `frontend/src/app/noticias/[id]/page.tsx` — query Strapi by slug/documentId/legacy route, restyle article detail.
- `frontend/src/app/admin/publicidad/page.tsx` — add new ad position options.
- `frontend/next.config.ts` — add remote image patterns for Strapi/S3 assets if using `next/image`; if staying with `<img>`, only keep rewrites.

Verification commands:

- `cd frontend && bun run lint`
- `cd frontend && bun run build`
- `git status --short`

---

## Task 1: Add server-only Strapi helper

**Files:**
- Create: `frontend/src/app/lib/strapi.ts`

- [ ] **Step 1: Create the helper**

Create `frontend/src/app/lib/strapi.ts`:

```ts
import "server-only";

const STRAPI_API_URL = process.env.STRAPI_API_URL;
const STRAPI_READONLY_TOKEN = process.env.STRAPI_READONLY_TOKEN;
const ASSETS_URL = process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL;

export type StrapiEntity<T> = T & {
  id?: number;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export type StrapiCollection<T> = {
  data: Array<StrapiEntity<T>>;
  meta?: unknown;
};

export type StrapiSingle<T> = {
  data: StrapiEntity<T> | null;
  meta?: unknown;
};

export async function strapiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!STRAPI_API_URL) {
    throw new Error("Missing STRAPI_API_URL");
  }
  if (!STRAPI_READONLY_TOKEN) {
    throw new Error("Missing STRAPI_READONLY_TOKEN");
  }

  const url = `${STRAPI_API_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${STRAPI_READONLY_TOKEN}`,
      ...(init.headers || {}),
    },
    next: { revalidate: 60, ...(init.next as object | undefined) },
  });

  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export function mediaUrl(input?: string | null): string | null {
  if (!input) return null;
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  if (!ASSETS_URL) return input;
  return `${ASSETS_URL.replace(/\/$/, "")}/${input.replace(/^\//, "")}`;
}

export function mediaFromStrapi(media: unknown): string | null {
  if (!media || typeof media !== "object") return null;
  const maybe = media as { url?: string; data?: { url?: string; attributes?: { url?: string } }; attributes?: { url?: string } };
  return mediaUrl(maybe.url || maybe.attributes?.url || maybe.data?.url || maybe.data?.attributes?.url || null);
}

export function textOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}
```

- [ ] **Step 2: Run type/build verification**

Run:

```bash
cd frontend && bun run lint
```

Expected: lint completes, or only reports pre-existing unrelated warnings. If it reports `server-only` missing, install is not needed because Next.js provides it; check import spelling.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/lib/strapi.ts
git commit -m "feat: add Strapi server helper"
```

---

## Task 2: Add normalized content fetchers

**Files:**
- Create: `frontend/src/app/lib/content.ts`

- [ ] **Step 1: Create normalized types and fetchers**

Create `frontend/src/app/lib/content.ts`:

```ts
import "server-only";
import { mediaFromStrapi, strapiFetch, StrapiCollection, StrapiSingle, textOrEmpty } from "./strapi";

export type Category = {
  documentId: string;
  name: string;
  slug: string;
  order: number;
};

export type Article = {
  documentId: string;
  id?: number;
  title: string;
  subtitle: string;
  slug: string;
  type: string;
  image_url: string | null;
  published_at: string;
  author?: string;
  content: string;
  is_premium?: boolean;
};

export type TonyOpinion = {
  documentId: string;
  title: string;
  slug: string;
  summary: string;
  date: string;
  imageUrl: string | null;
  authorName: string;
  authorPhoto: string | null;
  authorPosition: string;
};

export type PollOption = { key: string; label: string; count: number };
export type Poll = {
  documentId: string;
  title: string;
  question: string;
  description: string;
  options: PollOption[];
};

type RawArticle = Record<string, unknown>;
type RawCategory = Record<string, unknown>;
type RawOpinion = Record<string, unknown>;
type RawPoll = Record<string, unknown>;

function normalizeCategory(item: RawCategory): Category {
  return {
    documentId: textOrEmpty(item.documentId),
    name: textOrEmpty(item.name),
    slug: textOrEmpty(item.slug),
    order: typeof item.order === "number" ? item.order : 0,
  };
}

export function normalizeArticle(item: RawArticle): Article {
  const category = item.category as { name?: string; slug?: string } | undefined;
  return {
    documentId: textOrEmpty(item.documentId),
    id: typeof item.legacyId === "number" ? item.legacyId : typeof item.id === "number" ? item.id : undefined,
    title: textOrEmpty(item.title),
    subtitle: textOrEmpty(item.subtitle),
    slug: textOrEmpty(item.slug) || textOrEmpty(item.documentId),
    type: textOrEmpty(category?.name) || textOrEmpty(category?.slug) || "Noticias",
    image_url: mediaFromStrapi(item.coverImage) || textOrEmpty(item.legacyImageUrl) || null,
    published_at: textOrEmpty(item.publishedDate) || textOrEmpty(item.publishedAt) || new Date().toISOString(),
    author: textOrEmpty(item.authorName),
    content: textOrEmpty(item.body) || textOrEmpty(item.legacyContent),
    is_premium: Boolean(item.isPremium),
  };
}

function normalizeOpinion(item: RawOpinion): TonyOpinion {
  const profile = item.columnistProfile as Record<string, unknown> | undefined;
  return {
    documentId: textOrEmpty(item.documentId),
    title: textOrEmpty(item.title),
    slug: textOrEmpty(item.slug),
    summary: textOrEmpty(item.summary),
    date: textOrEmpty(item.date) || textOrEmpty(item.scheduledAt),
    imageUrl: mediaFromStrapi(item.image),
    authorName: textOrEmpty(profile?.fullName) || textOrEmpty(item.authorName) || "Tony D. Reyes",
    authorPhoto: mediaFromStrapi(profile?.photo),
    authorPosition: textOrEmpty(profile?.position) || textOrEmpty(profile?.dedication) || "Columnista",
  };
}

function normalizePoll(item: RawPoll): Poll {
  const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  return {
    documentId: textOrEmpty(item.documentId),
    title: textOrEmpty(item.title) || "Reto Diario",
    question: textOrEmpty(item.question),
    description: textOrEmpty(item.description),
    options: keys
      .map((key) => ({ key, label: textOrEmpty(item[`option${key}`]), count: Number(item[`count${key}`] || 0) }))
      .filter((option) => option.label.length > 0),
  };
}

export async function getCategories(): Promise<Category[]> {
  const data = await strapiFetch<StrapiCollection<RawCategory>>("/api/categories?sort[0]=order:asc");
  return data.data.map(normalizeCategory).filter((category) => category.slug && category.name);
}

export async function getHomepageArticles(): Promise<Article[]> {
  const path = "/api/articles?sort[0]=publishedDate:desc&pagination[pageSize]=12&populate=*";
  const data = await strapiFetch<StrapiCollection<RawArticle>>(path);
  return data.data.map(normalizeArticle).filter((article) => article.title);
}

export async function getArticleBySlugOrId(slugOrId: string): Promise<Article | null> {
  const bySlug = await strapiFetch<StrapiCollection<RawArticle>>(`/api/articles?filters[slug][$eq]=${encodeURIComponent(slugOrId)}&populate=*`);
  const slugMatch = bySlug.data[0];
  if (slugMatch) return normalizeArticle(slugMatch);

  const byDocument = await strapiFetch<StrapiSingle<RawArticle>>(`/api/articles/${encodeURIComponent(slugOrId)}?populate=*`).catch(() => ({ data: null }));
  if (byDocument.data) return normalizeArticle(byDocument.data);

  const byLegacy = await strapiFetch<StrapiCollection<RawArticle>>(`/api/articles?filters[legacyId][$eq]=${encodeURIComponent(slugOrId)}&populate=*`).catch(() => ({ data: [] }));
  return byLegacy.data[0] ? normalizeArticle(byLegacy.data[0]) : null;
}

export async function getLatestTonyOpinion(): Promise<TonyOpinion | null> {
  const path = "/api/daily-opinions?filters[isActive][$eq]=true&sort[0]=date:desc&pagination[pageSize]=1&populate=*";
  const data = await strapiFetch<StrapiCollection<RawOpinion>>(path);
  return data.data[0] ? normalizeOpinion(data.data[0]) : null;
}

export async function getActivePoll(now = new Date()): Promise<Poll | null> {
  const data = await strapiFetch<StrapiCollection<RawPoll>>("/api/polls?filters[isActive][$eq]=true&sort[0]=order:asc&sort[1]=startsAt:desc&populate=*");
  const active = data.data.find((poll) => {
    const startsAt = textOrEmpty(poll.startsAt);
    const endsAt = textOrEmpty(poll.endsAt);
    const afterStart = !startsAt || new Date(startsAt) <= now;
    const beforeEnd = !endsAt || new Date(endsAt) >= now;
    return afterStart && beforeEnd;
  });
  return active ? normalizePoll(active) : null;
}
```

- [ ] **Step 2: Run verification**

```bash
cd frontend && bun run lint
```

Expected: no TypeScript/ESLint errors from `content.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/lib/content.ts
git commit -m "feat: normalize Strapi content"
```

---

## Task 3: Add protected poll vote route

**Files:**
- Create: `frontend/src/app/api/polls/[documentId]/vote/route.ts`

- [ ] **Step 1: Create route handler**

Create `frontend/src/app/api/polls/[documentId]/vote/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

const STRAPI_API_URL = process.env.STRAPI_API_URL;
const POLL_VOTE_TOKEN = process.env.POLL_VOTE_TOKEN;

const VALID_OPTIONS = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "I"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  const body = await request.json().catch(() => null) as { option?: string } | null;
  const option = body?.option?.toUpperCase();

  if (!STRAPI_API_URL || !POLL_VOTE_TOKEN) {
    return NextResponse.json({ error: "Poll voting is not configured" }, { status: 500 });
  }

  if (!option || !VALID_OPTIONS.has(option)) {
    return NextResponse.json({ error: "Invalid poll option" }, { status: 400 });
  }

  const res = await fetch(`${STRAPI_API_URL}/api/polls/${encodeURIComponent(documentId)}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Poll-Vote-Token": POLL_VOTE_TOKEN,
    },
    body: JSON.stringify({ option }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
```

- [ ] **Step 2: Verify route types**

```bash
cd frontend && bun run lint
```

Expected: route compiles without exposing `POLL_VOTE_TOKEN` to client code.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/api/polls/[documentId]/vote/route.ts
git commit -m "feat: proxy poll votes securely"
```

---

## Task 4: Implement DailyChallengeCard

**Files:**
- Create: `frontend/src/app/components/DailyChallengeCard.tsx`

- [ ] **Step 1: Create client component**

Create `frontend/src/app/components/DailyChallengeCard.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import type { Poll } from "@/app/lib/content";

export default function DailyChallengeCard({ poll }: { poll: Poll | null }) {
  const [selected, setSelected] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries((poll?.options || []).map((o) => [o.key, o.count])));
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  const total = useMemo(() => Object.values(counts).reduce((sum, count) => sum + count, 0), [counts]);

  async function vote() {
    if (!poll || !selected) return;
    setStatus("saving");
    const res = await fetch(`/api/polls/${poll.documentId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ option: selected }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      return;
    }
    if (data?.data?.counts) setCounts(data.data.counts);
    setStatus("done");
  }

  return (
    <section className="bg-surface border border-border-light dark:bg-dark-surface dark:border-border-dark rounded-lg p-6 text-center md:text-left">
      <span className="block text-secondary dark:text-secondary-fixed-dim text-xs font-black uppercase tracking-[0.25em] mb-2">Reto Diario</span>
      <h2 className="font-serif text-2xl font-bold text-primary dark:text-primary-fixed-dim mb-3">
        {poll?.title || "Participa en el reto de hoy"}
      </h2>
      <p className="text-on-surface-variant dark:text-surface-variant mb-5 leading-relaxed">
        {poll?.question || "Muy pronto tendremos un nuevo reto diario para nuestros lectores."}
      </p>
      {poll?.description && <p className="text-sm text-on-surface-variant dark:text-surface-variant mb-4">{poll.description}</p>}

      <div className="space-y-2 mb-5">
        {(poll?.options || []).map((option) => {
          const count = counts[option.key] || 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelected(option.key)}
              className={`w-full border px-3 py-2 text-left text-sm transition-colors ${selected === option.key ? "border-secondary bg-secondary/10" : "border-border dark:border-border-dark hover:border-secondary"}`}
            >
              <span className="font-bold mr-2">{option.key}.</span>{option.label}
              {status === "done" && <span className="float-right font-bold text-primary dark:text-primary-fixed-dim">{percent}%</span>}
            </button>
          );
        })}
      </div>

      {poll ? (
        <button onClick={vote} disabled={!selected || status === "saving" || status === "done"} className="w-full bg-secondary text-white py-3 px-4 text-xs font-black uppercase tracking-widest disabled:opacity-50">
          {status === "saving" ? "Enviando..." : status === "done" ? "Voto registrado" : "Responder reto"}
        </button>
      ) : (
        <div className="border border-dashed border-border dark:border-border-dark py-3 text-sm text-muted-foreground">Sin reto activo</div>
      )}
      {status === "error" && <p className="mt-3 text-sm text-secondary">No se pudo registrar el voto. Intenta nuevamente.</p>}
    </section>
  );
}
```

- [ ] **Step 2: Verify component**

```bash
cd frontend && bun run lint
```

Expected: no lint errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/components/DailyChallengeCard.tsx
git commit -m "feat: add daily challenge poll card"
```

---

## Task 5: Implement TonyColumnCard

**Files:**
- Create: `frontend/src/app/components/TonyColumnCard.tsx`

- [ ] **Step 1: Create component**

Create `frontend/src/app/components/TonyColumnCard.tsx`:

```tsx
import Link from "next/link";
import type { TonyOpinion } from "@/app/lib/content";

export default function TonyColumnCard({ opinion }: { opinion: TonyOpinion | null }) {
  return (
    <section className="bg-surface-container-low border border-border-light dark:bg-dark-surface dark:border-border-dark p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary-container/10 rounded-bl-full" />
      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3 mb-4 relative z-10">
        <h2 className="font-serif text-xl font-bold text-primary dark:text-primary-fixed-dim">La Columna</h2>
        <span className="text-secondary dark:text-secondary-fixed-dim text-xs font-black uppercase tracking-widest">Diaria</span>
      </div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        {opinion?.authorPhoto ? (
          <img src={opinion.authorPhoto} alt={opinion.authorName} className="w-16 h-16 rounded-full object-cover grayscale border border-border dark:border-border-dark" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold">TDR</div>
        )}
        <div>
          <h3 className="font-serif text-xl font-bold text-primary dark:text-white">{opinion?.authorName || "Tony D. Reyes"}</h3>
          <p className="text-xs uppercase tracking-widest text-on-surface-variant dark:text-surface-variant">{opinion?.authorPosition || "Columnista"}</p>
        </div>
      </div>
      <h4 className="font-serif text-2xl font-semibold italic text-primary dark:text-white mb-3 relative z-10">
        {opinion?.title || "La mirada del día"}
      </h4>
      <p className="text-on-surface-variant dark:text-surface-variant leading-relaxed mb-4 relative z-10 line-clamp-4">
        {opinion?.summary || "Análisis y opinión sobre los temas principales de la jornada."}
      </p>
      <Link href={opinion?.slug ? `/opinion/${opinion.slug}` : "#"} className="text-secondary dark:text-primary-fixed-dim text-sm font-bold uppercase tracking-widest hover:underline relative z-10">
        Leer columna →
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Verify component**

```bash
cd frontend && bun run lint
```

Expected: no lint errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/components/TonyColumnCard.tsx
git commit -m "feat: add Tony column card"
```

---

## Task 6: Update design tokens and global styles

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Replace CSS variables with Stitch tokens**

Update `frontend/src/app/globals.css` variable blocks to include:

```css
:root {
  --background: #FCFBF9;
  --foreground: #1b1b1c;
  --muted: #f0edee;
  --muted-foreground: #43474f;
  --accent: #f6f3f4;
  --border: #E5E3E0;
  --card: #fcf8f9;
  --card-foreground: #1b1b1c;
  --primary: #001e40;
  --primary-foreground: #ffffff;
  --secondary: #b6171e;
  --secondary-foreground: #ffffff;
  --surface: #fcf8f9;
  --surface-container-low: #f6f3f4;
  --surface-container: #f0edee;
  --surface-container-highest: #e5e2e3;
  --on-surface-variant: #43474f;
  --dark-bg: #0B111B;
  --dark-surface: #161F2C;
  --border-light: #E5E3E0;
  --border-dark: #2D3748;
  --primary-fixed-dim: #a7c8ff;
  --secondary-fixed-dim: #ffb3ac;
}

.dark {
  --background: #0B111B;
  --foreground: #f3f0f1;
  --muted: #161F2C;
  --muted-foreground: #c3c6d1;
  --accent: #161F2C;
  --border: #2D3748;
  --card: #161F2C;
  --card-foreground: #f3f0f1;
  --primary: #a7c8ff;
  --primary-foreground: #001b3c;
  --secondary: #ffb3ac;
  --secondary-foreground: #410003;
}
```

Ensure `@theme inline` includes the new color aliases:

```css
@theme inline {
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-surface: var(--surface);
  --color-surface-container-low: var(--surface-container-low);
  --color-surface-container: var(--surface-container);
  --color-surface-container-highest: var(--surface-container-highest);
  --color-on-surface-variant: var(--on-surface-variant);
  --color-dark-bg: var(--dark-bg);
  --color-dark-surface: var(--dark-surface);
  --color-border-light: var(--border-light);
  --color-border-dark: var(--border-dark);
  --color-primary-fixed-dim: var(--primary-fixed-dim);
  --color-secondary-fixed-dim: var(--secondary-fixed-dim);
}
```

Keep existing `--color-dr-blue` and `--color-dr-red` aliases for admin compatibility.

- [ ] **Step 2: Verify styles compile**

```bash
cd frontend && bun run build
```

Expected: Tailwind compiles without unknown class failures.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "style: apply premium editorial tokens"
```

---

## Task 7: Upgrade AdBanner and admin positions

**Files:**
- Modify: `frontend/src/app/components/AdBanner.tsx`
- Modify: `frontend/src/app/admin/publicidad/page.tsx`

- [ ] **Step 1: Update AdBanner placeholder and rotation indicator**

In `AdBanner.tsx`, add a position config near the top:

```ts
const AD_POSITION_CONFIG: Record<string, { label: string; size: string; className: string }> = {
  header: { label: "Publicidad", size: "728x90", className: "h-24 md:aspect-[728/90]" },
  home_left: { label: "Espacio patrocinado", size: "300x250", className: "h-[250px]" },
  home_middle: { label: "Publicidad", size: "728x90", className: "h-28 md:h-32" },
  sidebar_top: { label: "Publicidad", size: "300x250", className: "h-[250px]" },
  sidebar_bottom: { label: "Publicidad", size: "300x600", className: "min-h-[420px]" },
  article_sidebar: { label: "Espacio patrocinado", size: "300x600", className: "min-h-[420px]" },
};

const CONTACT_NUMBER = "809-555-0100";
```

Replace the empty state with:

```tsx
const config = AD_POSITION_CONFIG[position] || AD_POSITION_CONFIG.header;

if (ads.length === 0) {
  return (
    <div className={`w-full bg-surface-container-low dark:bg-dark-surface border border-dashed border-border-light dark:border-border-dark flex flex-col items-center justify-center text-center px-4 ${config.className} ${className}`}>
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">{config.label}</span>
      <strong className="font-serif text-xl text-primary dark:text-primary-fixed-dim">Anúnciate aquí</strong>
      <span className="text-sm text-on-surface-variant dark:text-surface-variant mt-2">{config.size}</span>
      <span className="text-sm font-bold text-secondary dark:text-secondary-fixed-dim mt-3">Contacto: {CONTACT_NUMBER}</span>
    </div>
  );
}
```

Add rotation count overlay inside the active ad link:

```tsx
{ads.length > 1 && (
  <div className="absolute bottom-0 right-0 bg-black/60 text-[10px] text-white px-2 py-0.5">
    {currentIndex + 1} / {ads.length}
  </div>
)}
```

- [ ] **Step 2: Add admin position options**

In `frontend/src/app/admin/publicidad/page.tsx`, find the position `<select>` and ensure it includes these exact values:

```tsx
<option value="header">Header superior 728x90</option>
<option value="home_left">Portada izquierda 300x250</option>
<option value="home_middle">Portada centro 728x90</option>
<option value="sidebar_top">Sidebar superior 300x250</option>
<option value="sidebar_bottom">Sidebar inferior 300x600</option>
<option value="article_sidebar">Artículo sidebar 300x600</option>
```

- [ ] **Step 3: Verify**

```bash
cd frontend && bun run lint
```

Expected: no lint errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/AdBanner.tsx frontend/src/app/admin/publicidad/page.tsx
git commit -m "feat: improve editorial ad placements"
```

---

## Task 8: Restyle header and footer

**Files:**
- Modify: `frontend/src/app/components/SiteHeader.tsx`
- Modify: `frontend/src/app/components/SiteFooter.tsx`

- [ ] **Step 1: Update header shell**

Refactor `SiteHeader` JSX to match Stitch while preserving existing state/search/auth logic. Use this structure for the returned header:

```tsx
<header className="bg-background/95 dark:bg-dark-bg/95 backdrop-blur sticky top-0 z-50 border-b border-border-light dark:border-border-dark">
  <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-4">
    <div className="flex items-center justify-between gap-4 mb-3">
      <div className="hidden md:block text-xs uppercase tracking-widest text-on-surface-variant dark:text-surface-variant">
        {new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </div>
      <Link href="/" className="flex items-center gap-3">
        <img src="/logo-header.png" alt="DAgendaNG" className="h-14 md:h-16 w-auto object-contain" />
      </Link>
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="hidden md:flex items-center border border-border dark:border-border-dark h-10 px-3 bg-surface dark:bg-dark-surface">
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar" className="bg-transparent outline-none text-sm w-32" />
          <button type="submit" className="text-primary dark:text-primary-fixed-dim">⌕</button>
        </form>
        <ThemeToggle />
        <Link href="/registro" className="hidden md:inline-flex bg-primary text-primary-foreground px-4 py-2 text-xs font-black uppercase tracking-widest">Suscribirse</Link>
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú">☰</button>
      </div>
    </div>
    <nav className="hidden md:flex justify-center gap-6 border-t border-border-light dark:border-border-dark pt-3 overflow-x-auto">
      <Link href="/" className="text-secondary text-sm font-bold uppercase tracking-widest border-b-2 border-secondary pb-1">Inicio</Link>
      {categories.map((cat) => (
        <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim text-sm font-bold uppercase tracking-widest pb-1">
          {cat.name}
        </Link>
      ))}
    </nav>
  </div>
</header>
```

Keep the existing mobile menu below this shell and restyle it with `bg-background dark:bg-dark-bg` and border classes.

- [ ] **Step 2: Restyle footer**

Replace footer body in `SiteFooter.tsx` with a 4-column Stitch footer:

```tsx
<footer className="bg-surface-container-highest dark:bg-dark-surface border-t border-border-light dark:border-border-dark mt-12">
  <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
    <div className="md:col-span-2">
      <h2 className="text-3xl font-serif font-bold text-primary dark:text-primary-fixed-dim mb-3">DAgendaNG</h2>
      <p className="text-on-surface-variant dark:text-surface-variant">Periodismo con autoridad. De Agenda con Nelson Gómez.</p>
    </div>
    <nav className="flex flex-col gap-2 text-sm text-on-surface-variant dark:text-surface-variant">
      <a href="/">Inicio</a>
      <a href="/buscar">Buscar</a>
      <a href="/registro">Suscripción</a>
    </nav>
    <div className="text-sm text-on-surface-variant dark:text-surface-variant">
      <p>&copy; {new Date().getFullYear()} DAgendaNG.</p>
      <p>Derechos reservados.</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Verify**

```bash
cd frontend && bun run lint
```

Expected: no lint errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/SiteHeader.tsx frontend/src/app/components/SiteFooter.tsx
git commit -m "style: restyle public header and footer"
```

---

## Task 9: Restyle NewsGrid and add in-content ad slot

**Files:**
- Modify: `frontend/src/app/components/NewsGrid.tsx`

- [ ] **Step 1: Update Article interface compatibility**

Ensure the `Article` interface includes Strapi normalized fields:

```ts
interface Article {
  id?: number;
  documentId?: string;
  title: string;
  slug?: string;
  type: string;
  image_url?: string | null;
  published_at: string;
  author?: string;
  subtitle?: string;
  content: string;
}
```

Use this href helper inside `NewsGridContent`:

```ts
const articleHref = (article: Article) => `/noticias/${article.slug || article.documentId || article.id}`;
```

Replace `href={`/noticias/${article.id}`}` with `href={articleHref(article)}`.

- [ ] **Step 2: Apply Stitch card classes**

For the featured article wrapper, use:

```tsx
<Link href={articleHref(mainArticle)} className="group cursor-pointer block transition-transform duration-500 hover:-translate-y-1">
```

For the featured headline, use:

```tsx
<h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 leading-tight text-primary dark:text-white group-hover:text-secondary transition-colors">
```

For secondary article cards, use sharp images and editorial labels:

```tsx
<div className="w-full aspect-video bg-muted mb-3 overflow-hidden border border-border-light dark:border-border-dark">
```

- [ ] **Step 3: Insert in-content ad**

After the featured article block and before secondary grid, insert:

```tsx
<AdGuard>
  <AdBanner position="home_middle" className="my-8" />
</AdGuard>
```

Add imports if missing:

```ts
import AdBanner from "@/app/components/AdBanner";
import AdGuard from "@/app/components/AdGuard";
```

- [ ] **Step 4: Verify**

```bash
cd frontend && bun run lint
```

Expected: no lint errors and no broken href typing.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/components/NewsGrid.tsx
git commit -m "style: align news grid with editorial design"
```

---

## Task 10: Implement Strapi-powered homepage layout

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Replace FastAPI article fetching with Strapi fetchers**

In `page.tsx`, import:

```ts
import { getActivePoll, getHomepageArticles, getLatestTonyOpinion } from "@/app/lib/content";
import DailyChallengeCard from "@/app/components/DailyChallengeCard";
import TonyColumnCard from "@/app/components/TonyColumnCard";
```

In `Home`, fetch:

```ts
const [articles, poll, tonyOpinion, rates, fuel] = await Promise.all([
  getHomepageArticles(),
  getActivePoll(),
  getLatestTonyOpinion(),
  getExchangeRates(),
  getFuelPrices(),
]);
```

Set:

```ts
const mainArticle = articles[0] || null;
const secondaryArticles = articles.slice(1, 9);
const totalArticles = articles.length;
```

- [ ] **Step 2: Replace homepage JSX with 12-column grid**

Use:

```tsx
<div className="w-full">
  <AdGuard>
    <AdBanner position="header" className="border-b border-border-light dark:border-border-dark" />
  </AdGuard>

  <div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10 md:py-16">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3 xl:col-span-2 space-y-8 lg:border-r lg:border-border-light dark:lg:border-border-dark lg:pr-6">
        <DailyChallengeCard poll={poll} />
        <AdGuard><AdBanner position="home_left" /></AdGuard>
      </aside>

      <section className="lg:col-span-6 xl:col-span-7 lg:px-2">
        <NewsGrid mainArticle={mainArticle} initialArticles={secondaryArticles} totalArticles={totalArticles} pageSize={8} />
      </section>

      <aside className="lg:col-span-3 space-y-8 lg:border-l lg:border-border-light dark:lg:border-border-dark lg:pl-6">
        <TonyColumnCard opinion={tonyOpinion} />
        <EconomyIndicators initialRates={rates} initialFuel={fuel} />
        <AdGuard><AdBanner position="sidebar_top" /></AdGuard>
        <AdGuard><AdBanner position="sidebar_bottom" /></AdGuard>
      </aside>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify real env keys are present without printing token values**

Run:

```bash
cd frontend && for key in STRAPI_API_URL STRAPI_READONLY_TOKEN POLL_VOTE_TOKEN NEXT_PUBLIC_STRAPI_ASSETS_URL; do test -n "$(grep "^$key=" .env | cut -d= -f2-)" && echo "$key=present"; done
```

Expected: each key prints `present`.

- [ ] **Step 4: Build**

```bash
cd frontend && bun run build
```

Expected: build succeeds and homepage prerender/server rendering can fetch Strapi. If Strapi network is unavailable from the container, record the network error and verify with `bun run lint` before committing.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: render Strapi-powered editorial homepage"
```

---

## Task 11: Restyle article detail with Strapi data

**Files:**
- Modify: `frontend/src/app/noticias/[id]/page.tsx`

- [ ] **Step 1: Replace article fetcher**

Import:

```ts
import { getActivePoll, getArticleBySlugOrId, getLatestTonyOpinion } from "@/app/lib/content";
import DailyChallengeCard from "@/app/components/DailyChallengeCard";
import TonyColumnCard from "@/app/components/TonyColumnCard";
```

Update `getArticle(id)` to call:

```ts
async function getArticle(id: string) {
  return getArticleBySlugOrId(id);
}
```

- [ ] **Step 2: Fetch sidebar data in ArticlePage**

Add:

```ts
const [poll, tonyOpinion] = await Promise.all([getActivePoll(), getLatestTonyOpinion()]);
```

near the existing article/rates/fuel fetches.

- [ ] **Step 3: Replace outer layout classes**

Use an 8/4 grid:

```tsx
<div className="w-full max-w-[1280px] mx-auto px-5 md:px-10 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
  <article className="lg:col-span-8">
    ...article content...
  </article>
  <aside className="lg:col-span-4 flex flex-col gap-8">
    <TonyColumnCard opinion={tonyOpinion} />
    <DailyChallengeCard poll={poll} />
    <AdGuard><AdBanner position="article_sidebar" /></AdGuard>
    <EconomyIndicators initialRates={rates} initialFuel={fuel} />
  </aside>
</div>
```

- [ ] **Step 4: Apply article typography**

Use these classes for title and body wrapper:

```tsx
<h1 className="font-serif text-4xl md:text-6xl font-bold text-primary dark:text-white leading-tight mb-4">
  {article.title}
</h1>
{article.subtitle && (
  <p className="text-xl text-on-surface-variant dark:text-surface-variant leading-relaxed mb-6">{article.subtitle}</p>
)}
```

Keep `PremiumContentWrapper` for `article.content` and `article.is_premium`.

- [ ] **Step 5: Verify metadata still works**

Ensure `generateMetadata` uses `article.image_url`, `article.title`, `article.content`, and `article.published_at` from the normalized type.

- [ ] **Step 6: Build**

```bash
cd frontend && bun run build
```

Expected: dynamic article page builds without TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/noticias/[id]/page.tsx
git commit -m "feat: render Strapi editorial article pages"
```

---

## Task 12: Final verification and review

**Files:**
- No required code changes unless verification exposes defects.

- [ ] **Step 1: Run lint**

```bash
cd frontend && bun run lint
```

Expected: pass.

- [ ] **Step 2: Run production build**

```bash
cd frontend && bun run build
```

Expected: pass. If external Strapi access fails because the environment cannot reach the URL, capture the exact error and verify that type/lint pass.

- [ ] **Step 3: Smoke-test important routes locally**

Run:

```bash
cd frontend && bun run dev
```

Open:

- `/`
- `/noticias/<slug-from-real-Strapi-article>`
- `/buscar`
- `/admin/publicidad`

Expected:

- Homepage shows real Strapi articles, active poll, Tony opinion, and ad slots.
- Article detail shows normalized Strapi article data.
- Poll vote request goes to `/api/polls/:documentId/vote` and never exposes `POLL_VOTE_TOKEN` in browser code.
- Admin ad form includes new positions.

- [ ] **Step 4: Check git diff**

```bash
git status --short
git diff --stat HEAD
```

Expected: only intended frontend files changed.

- [ ] **Step 5: Commit final fixes if any**

```bash
git add frontend
git commit -m "fix: polish editorial Strapi integration"
```

Only run this commit if verification required additional fixes after the previous task commits.

---

## Self-review

- Spec coverage: homepage layout, article layout, Stitch tokens, Strapi articles, Tony daily opinion, Reto Diario poll, poll vote proxy, ad placeholders/contact/rotation, and admin ad positions are each covered by a task.
- Placeholder scan: no incomplete markers or unspecified implementation steps remain.
- Type consistency: normalized content types are defined in Task 2 and reused by Tasks 4, 5, 10, and 11.
- Token safety: `STRAPI_READONLY_TOKEN` and `POLL_VOTE_TOKEN` are only used in server-only helper/route code.
