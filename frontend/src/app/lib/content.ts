import "server-only";
import { mediaFromStrapi, mediaListFromStrapi, strapiFetch, StrapiCollection, StrapiSingle, textOrEmpty } from "./strapi";

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

function normalizeCategory(item: RawCategory): Category {
  return {
    documentId: textOrEmpty(item.documentId),
    name: textOrEmpty(item.name),
    slug: textOrEmpty(item.slug),
    order: typeof item.order === "number" ? item.order : 0,
  };
}

export function normalizeArticle(item: RawArticle): Article {
  const category = unwrapRelation(item.category);
  const articleImages = mediaListFromStrapi(item.articleImages);
  const adImages = mediaListFromStrapi(item.adImages);
  const coverUrl = mediaFromStrapi(item.coverImage);
  const secondaryUrl = mediaFromStrapi(item.secondaryImage1) || mediaFromStrapi(item.secondaryImage2);

  return {
    documentId: textOrEmpty(item.documentId),
    id: typeof item.legacyId === "number" ? item.legacyId : typeof item.id === "number" ? item.id : undefined,
    title: textOrEmpty(item.title),
    subtitle: textOrEmpty(item.subtitle),
    slug: textOrEmpty(item.slug) || textOrEmpty(item.documentId),
    type: textOrEmpty(category?.name) || textOrEmpty(category?.slug) || "Noticias",
    image_url: coverUrl || articleImages[0] || secondaryUrl || textOrEmpty(item.legacyImageUrl) || null,
    articleImages,
    adImages,
    published_at: textOrEmpty(item.publishedDate) || textOrEmpty(item.publishedAt) || new Date().toISOString(),
    author: textOrEmpty(item.authorName),
    content: textOrEmpty(item.body) || textOrEmpty(item.legacyContent),
    is_premium: Boolean(item.isPremium),
  };
}

function normalizeOpinion(item: RawOpinion): TonyOpinion {
  const profile = unwrapRelation(item.columnistProfile);
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

function normalizeAdvertisement(item: RawAdvertisement): Advertisement {
  return {
    documentId: textOrEmpty(item.documentId),
    title: textOrEmpty(item.title),
    slug: textOrEmpty(item.slug),
    images: mediaListFromStrapi(item.images),
    linkUrl: textOrEmpty(item.linkUrl),
    position: textOrEmpty(item.position),
    order: typeof item.order === "number" ? item.order : 0,
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

export async function getArticlesByCategory(slug: string): Promise<Article[]> {
  const path = `/api/articles?filters[category][slug][$eq]=${encodeURIComponent(slug)}&sort[0]=publishedDate:desc&pagination[pageSize]=50&populate=*`;
  const data = await strapiFetch<StrapiCollection<RawArticle>>(path);
  return data.data.map(normalizeArticle).filter((article) => article.title);
}

export async function getAdvertisements(position?: string): Promise<Advertisement[]> {
  const filters = position ? `&filters[position][$eq]=${encodeURIComponent(position)}` : "";
  const path = `/api/advertisements?filters[isActive][$eq]=true${filters}&sort[0]=order:asc&populate=*`;
  const data = await strapiFetch<StrapiCollection<RawAdvertisement>>(path);
  return data.data.map(normalizeAdvertisement).filter((ad) => ad.images.length > 0);
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
  const path = "/api/daily-opinions?filters[isActive][$eq]=true&sort[0]=date:desc&pagination[pageSize]=1&populate[image]=true&populate[columnistProfile][populate][photo]=true";
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
