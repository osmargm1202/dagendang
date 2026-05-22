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
