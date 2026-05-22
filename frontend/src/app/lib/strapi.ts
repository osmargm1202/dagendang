import "server-only";

const STRAPI_API_URL = cleanEnv(process.env.STRAPI_API_URL);
const STRAPI_READONLY_TOKEN = cleanEnv(process.env.STRAPI_READONLY_TOKEN);
const ASSETS_URL = cleanEnv(process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL);

function cleanEnv(value?: string) {
  return value?.trim().replace(/^['\"]|['\"]$/g, "");
}

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

  if (input.startsWith("http://") || input.startsWith("https://")) {
    if (!ASSETS_URL) return input;

    try {
      const parsed = new URL(input);
      const uploadPath = parsed.pathname.match(/\/uploads\/.+$/)?.[0];
      return uploadPath ? `${ASSETS_URL.replace(/\/$/, "")}${uploadPath}` : input;
    } catch {
      return input;
    }
  }

  if (!ASSETS_URL) return input;
  const normalizedPath = input.replace(/^\//, "").replace(/^dagendang-assets\//, "");
  return `${ASSETS_URL.replace(/\/$/, "")}/${normalizedPath}`;
}

export function mediaListFromStrapi(media: unknown): string[] {
  if (!media) return [];

  if (Array.isArray(media)) {
    return media.flatMap((item) => mediaListFromStrapi(item));
  }

  if (typeof media !== "object") return [];

  const maybe = media as {
    url?: string;
    data?: unknown;
    attributes?: { url?: string; formats?: Record<string, { url?: string }> };
    formats?: Record<string, { url?: string }>;
  };

  if (Array.isArray(maybe.data)) return maybe.data.flatMap((item) => mediaListFromStrapi(item));
  if (maybe.data) return mediaListFromStrapi(maybe.data);

  const directUrl = maybe.url || maybe.attributes?.url;
  if (directUrl) {
    const resolved = mediaUrl(directUrl);
    return resolved ? [resolved] : [];
  }

  const formats = maybe.formats || maybe.attributes?.formats;
  const formatUrl = formats?.large?.url || formats?.medium?.url || formats?.small?.url || formats?.thumbnail?.url;
  const resolved = mediaUrl(formatUrl || null);
  return resolved ? [resolved] : [];
}

export function mediaFromStrapi(media: unknown): string | null {
  return mediaListFromStrapi(media)[0] || null;
}

export function textOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}
