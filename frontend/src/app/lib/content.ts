import "server-only";

import { mediaFromStrapi, mediaListFromStrapi, mediaUrl, strapiFetch, StrapiCollection, StrapiSingle, textOrEmpty } from "./strapi";

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
  articleImages: string[];
  adImages: string[];
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
  content: string;
  date: string;
  imageUrl: string | null;
  authorName: string;
  authorPhoto: string | null;
  authorPosition: string;
};

export type Advertisement = {
  documentId: string;
  title: string;
  slug: string;
  images: string[];
  linkUrl: string;
  position: string;
  order: number;
  rotationSeconds: number;
  advertiserName: string;
  siteName: string;
  siteUrl: string;
  contactName: string;
  contactPhone: string;
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
type RawAdvertisement = Record<string, unknown>;

function unwrapRelation(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const relation = value as { data?: unknown; attributes?: unknown } & Record<string, unknown>;

  if (Array.isArray(relation.data)) return unwrapRelation(relation.data[0]);
  if (relation.data) return unwrapRelation(relation.data);
  if (relation.attributes && typeof relation.attributes === "object") {
    return { ...relation, ...(relation.attributes as Record<string, unknown>) };
  }

  return relation;
}

function isArrayResponse<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

function toArray<T>(payload: T[] | { data?: T[] }): T[] {
  if (isArrayResponse(payload)) return payload;
  return payload?.data || [];
}

function normalizeCategory(item: RawCategory): Category {
  return {
    documentId: textOrEmpty(item.documentId),
    name: textOrEmpty(item.name),
    slug: textOrEmpty(item.slug),
    order: typeof item.order === "number" ? item.order : 0,
  };
}

function richTextToPlainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const children = (block as { children?: unknown }).children;
      if (!Array.isArray(children)) return "";
      return children
        .map((child) => (child && typeof child === "object" ? textOrEmpty((child as { text?: unknown }).text) : ""))
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeSlug(value: unknown): string {
  return normalizeText(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeArticle(item: RawArticle): Article {
  const category = unwrapRelation(item.category);
  const articleImages = mediaListFromStrapi(item.articleImages);
  const adImages = mediaListFromStrapi(item.adImages);
  const coverUrl = mediaFromStrapi(item.coverImage);
  const legacyImage = mediaUrl(textOrEmpty(item.image_url));
  const legacyImageUrl = mediaUrl(textOrEmpty(item.legacyImageUrl));
  const secondaryUrl = mediaFromStrapi(item.secondaryImage1) || mediaFromStrapi(item.secondaryImage2);

  return {
    documentId: textOrEmpty(item.documentId),
    id: typeof item.legacyId === "number" ? item.legacyId : typeof item.id === "number" ? item.id : undefined,
    title: textOrEmpty(item.title),
    subtitle: textOrEmpty(item.subtitle),
    slug: textOrEmpty(item.slug) || textOrEmpty(item.documentId),
    type: textOrEmpty(item.type) || textOrEmpty(category?.name) || textOrEmpty(category?.slug) || "Noticias",
    image_url: coverUrl || articleImages[0] || secondaryUrl || legacyImage || legacyImageUrl || null,
    articleImages,
    adImages,
    published_at: textOrEmpty(item.publishedDate) || textOrEmpty(item.publishedAt) || textOrEmpty(item.published_at) || new Date().toISOString(),
    author: textOrEmpty(item.authorName) || textOrEmpty(item.author),
    content: richTextToPlainText(item.body) || textOrEmpty(item.body) || textOrEmpty(item.content) || textOrEmpty(item.legacyContent),
    is_premium: Boolean((item.isPremium as boolean) ?? (item.is_premium as boolean)),
  };
}

function normalizeOpinion(item: RawOpinion): TonyOpinion {
  const profile = unwrapRelation(item.columnistProfile) || unwrapRelation(item.personality);
  return {
    documentId: textOrEmpty(item.documentId),
    title: textOrEmpty(item.title) || "La mirada del día",
    slug: textOrEmpty(item.slug),
    summary: textOrEmpty(item.summary) || textOrEmpty(profile?.shortCurriculum) || "Análisis y opinión sobre los temas principales de la jornada.",
    content: richTextToPlainText(item.body) || textOrEmpty(item.summary) || "",
    date: textOrEmpty(item.date) || textOrEmpty(item.scheduledAt) || textOrEmpty(item.publishedAt),
    imageUrl: mediaFromStrapi(item.image),
    authorName: textOrEmpty(profile?.fullName) || textOrEmpty(item.authorName) || "Tony D. Reyes",
    authorPhoto: mediaFromStrapi(item.photo) || mediaFromStrapi(profile?.photo),
    authorPosition: textOrEmpty(profile?.position) || textOrEmpty(profile?.dedication) || "Columnista",
  };
}

function normalizeTonyPersonality(item: RawOpinion): TonyOpinion {
  return {
    documentId: textOrEmpty(item.documentId),
    title: "La mirada del día",
    slug: "",
    summary: textOrEmpty(item.shortCurriculum) || "Análisis y opinión sobre los temas principales de la jornada.",
    content: textOrEmpty(item.shortCurriculum),
    date: textOrEmpty(item.publishedAt),
    imageUrl: null,
    authorName: textOrEmpty(item.fullName) || "Tony D. Reyes",
    authorPhoto: mediaFromStrapi(item.photo),
    authorPosition: textOrEmpty(item.position) || textOrEmpty(item.dedication) || "Columnista",
  };
}

function normalizeAdvertisement(item: RawAdvertisement): Advertisement {
  return {
    documentId: textOrEmpty(item.documentId),
    title: textOrEmpty(item.title),
    slug: textOrEmpty(item.slug),
    images: mediaListFromStrapi(item.images),
    linkUrl: textOrEmpty(item.linkUrl) || textOrEmpty(item.siteUrl),
    position: textOrEmpty(item.position),
    order: typeof item.order === "number" ? item.order : 0,
    rotationSeconds: typeof item.rotationSeconds === "number" ? item.rotationSeconds : 5,
    advertiserName: textOrEmpty(item.advertiserName),
    siteName: textOrEmpty(item.siteName),
    siteUrl: textOrEmpty(item.siteUrl),
    contactName: textOrEmpty(item.contactName),
    contactPhone: textOrEmpty(item.contactPhone),
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
  const payload = await strapiFetch<StrapiCollection<RawCategory> | RawCategory[]>('/api/categories');
  const data = toArray(payload);
  return data
    .map(normalizeCategory)
    .filter((category) => category.slug && category.name);
}

const ARTICLE_POPULATE = "populate=*";
const ARTICLE_SORT = "sort[0]=publishedDate:desc&sort[1]=publishedAt:desc";

export type ArticlePageResult = {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function getArticlesPage(page = 1, pageSize = 5): Promise<ArticlePageResult> {
  const path = `/api/articles?status=published&pagination[page]=${page}&pagination[pageSize]=${pageSize}&${ARTICLE_SORT}&${ARTICLE_POPULATE}`;
  const payload = await strapiFetch<StrapiCollection<RawArticle> | RawArticle[]>(path);
  const data = toArray(payload);
  const meta = !Array.isArray(payload) && payload?.meta && typeof payload.meta === "object" ? payload.meta as { pagination?: { total?: number; page?: number; pageSize?: number; pageCount?: number } } : {};
  const pagination = meta.pagination || {};

  return {
    articles: data.map(normalizeArticle).filter((article) => article.title),
    total: pagination.total || data.length,
    page: pagination.page || page,
    pageSize: pagination.pageSize || pageSize,
    pageCount: pagination.pageCount || 1,
  };
}

export async function getHomepageArticles(): Promise<Article[]> {
  return (await getArticlesPage(1, 100)).articles;
}

export async function getArticlesByCategory(slug: string): Promise<Article[]> {
  const target = normalizeSlug(slug);
  const payload = await strapiFetch<StrapiCollection<RawArticle> | RawArticle[]>(`/api/articles?status=published&pagination[pageSize]=100&${ARTICLE_SORT}&${ARTICLE_POPULATE}`);
  const data = toArray(payload);

  return data
    .map(normalizeArticle)
    .filter((article) => {
      const articleType = normalizeSlug(article.type);
      const articleTitleAsCategory = normalizeSlug(article.slug);
      return articleType === target || articleTitleAsCategory === target;
    })
    .filter((article) => article.title);
}

export async function getAdvertisements(position?: string, limit = 10): Promise<Advertisement[]> {
  const filters = position ? `&filters[position][$eq]=${encodeURIComponent(position)}` : "";
  const now = new Date().toISOString();
  const activeWindow = `&filters[$and][0][$or][0][startsAt][$null]=true&filters[$and][0][$or][1][startsAt][$lte]=${encodeURIComponent(now)}&filters[$and][1][$or][0][endsAt][$null]=true&filters[$and][1][$or][1][endsAt][$gte]=${encodeURIComponent(now)}`;
  const payload = await strapiFetch<StrapiCollection<RawAdvertisement> | RawAdvertisement[]>(`/api/advertisements?status=published&filters[isActive][$eq]=true${filters}${activeWindow}&sort[0]=order:asc&sort[1]=publishedAt:desc&pagination[pageSize]=${limit}&populate=*` as const);
  const data = toArray(payload);
  return data.map(normalizeAdvertisement).filter((ad) => ad.images.length > 0).slice(0, limit);
}

export async function getArticleBySlugOrId(slugOrId: string): Promise<Article | null> {
  const asNumber = Number(slugOrId);
  if (!Number.isNaN(asNumber) && String(asNumber) === slugOrId) {
    const direct = await strapiFetch<StrapiSingle<RawArticle> | RawArticle>(`/api/articles/${encodeURIComponent(slugOrId)}`).catch(() => null);
    if (direct && !(Array.isArray(direct) as boolean) && (direct as StrapiSingle<RawArticle>).data && (direct as StrapiSingle<RawArticle>).data !== null) {
      return normalizeArticle((direct as StrapiSingle<RawArticle>).data as RawArticle);
    }
  }

  const payload = await strapiFetch<StrapiCollection<RawArticle> | RawArticle[]>(`/api/articles?status=published&pagination[pageSize]=500&${ARTICLE_SORT}&${ARTICLE_POPULATE}`).catch(() => [] as RawArticle[]);
  const data = toArray(payload);
  const match = data.find((article) => {
    const candidate = normalizeArticle(article);
    return candidate.slug === slugOrId || String(candidate.id) === slugOrId || candidate.documentId === slugOrId;
  });

  return match ? normalizeArticle(match) : null;
}

export async function getLatestTonyOpinion(): Promise<TonyOpinion | null> {
  const paths = [
    "/api/daily-opinions?status=published&filters[isActive][$eq]=true&sort[0]=date:desc&sort[1]=publishedAt:desc&pagination[pageSize]=1&populate[image]=true&populate[columnistProfile][populate][photo]=true",
    "/api/daily-opinions?status=published&sort[0]=date:desc&sort[1]=publishedAt:desc&pagination[pageSize]=1&populate[image]=true&populate[columnistProfile][populate][photo]=true",
    "/api/daily-opinions?status=published&filters[isActive][$eq]=true&sort[0]=date:desc&sort[1]=publishedAt:desc&pagination[pageSize]=1&populate=*",
  ];

  for (const path of paths) {
    try {
      const data = await strapiFetch<StrapiCollection<RawOpinion>>(path);
      const list = toArray(data);
      if (list[0]) return normalizeOpinion(list[0]);
    } catch (error) {
      console.warn("Daily opinion fetch fallback in use", path, error);
    }
  }

  try {
    const data = await strapiFetch<StrapiCollection<RawOpinion>>("/api/personalities?filters[slug][$eq]=tony-d-reyes&pagination[pageSize]=1&populate=*");
    const list = toArray(data);
    return list[0] ? normalizeTonyPersonality(list[0]) : null;
  } catch (error) {
    console.warn("Tony personality fetch failed", error);
    return null;
  }
}

export async function getDailyOpinionBySlug(slug: string): Promise<TonyOpinion | null> {
  const payload = await strapiFetch<StrapiCollection<RawOpinion>>(`/api/daily-opinions?status=published&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&populate[image]=true&populate[columnistProfile][populate][photo]=true`).catch(() => null);
  const list = payload ? toArray(payload) : [];
  return list[0] ? normalizeOpinion(list[0]) : null;
}

export async function getActivePoll(now = new Date()): Promise<Poll | null> {
  const payload = await strapiFetch<StrapiCollection<RawPoll> | RawPoll[]>("/api/polls?filters[isActive][$eq]=true&sort[0]=order:asc&sort[1]=startsAt:desc&populate=*");
  const data = toArray(payload);
  const active = data.find((poll) => {
    const startsAt = textOrEmpty(poll.startsAt);
    const endsAt = textOrEmpty(poll.endsAt);
    const afterStart = !startsAt || new Date(startsAt) <= now;
    const beforeEnd = !endsAt || new Date(endsAt) >= now;
    return afterStart && beforeEnd;
  });

  return active ? normalizePoll(active) : null;
}
