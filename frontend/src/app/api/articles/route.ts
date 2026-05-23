import { NextRequest, NextResponse } from "next/server";
import { normalizeArticle } from "@/app/lib/content";
import { strapiFetch, type StrapiCollection } from "@/app/lib/strapi";

type RawArticle = Record<string, unknown>;

type PaginationMeta = {
  pagination?: {
    page?: number;
    pageSize?: number;
    pageCount?: number;
    total?: number;
  };
};

const ARTICLE_SORT = "sort[0]=publishedDate:desc&sort[1]=publishedAt:desc";
const ARTICLE_POPULATE = "populate=*";

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function appendSearchFilters(params: URLSearchParams, search: string) {
  const fields = ["title", "subtitle", "legacyContent", "authorName"];
  fields.forEach((field, index) => {
    params.set(`filters[$or][${index}][${field}][$containsi]`, search);
  });
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const search = (query.get("search") || query.get("q") || "").trim();
  const page = positiveInt(query.get("page"), 1);
  const pageSize = Math.min(positiveInt(query.get("limit") || query.get("pageSize"), 20), 50);
  const skip = query.get("skip");

  const strapiParams = new URLSearchParams();
  strapiParams.set("status", query.get("status") || "published");

  if (skip !== null) {
    strapiParams.set("pagination[start]", String(Math.max(0, Number(skip) || 0)));
    strapiParams.set("pagination[limit]", String(pageSize));
  } else {
    strapiParams.set("pagination[page]", String(page));
    strapiParams.set("pagination[pageSize]", String(pageSize));
  }

  if (search) appendSearchFilters(strapiParams, search);

  const path = `/api/articles?${strapiParams.toString()}&${ARTICLE_SORT}&${ARTICLE_POPULATE}`;
  const payload = await strapiFetch<StrapiCollection<RawArticle>>(path);
  const articles = payload.data.map(normalizeArticle).filter((article) => article.title);
  const meta = (payload.meta || {}) as PaginationMeta;
  const total = meta.pagination?.total ?? articles.length;

  return NextResponse.json(articles, {
    headers: {
      "X-Total-Count": String(total),
      "X-Page": String(meta.pagination?.page ?? page),
      "X-Page-Size": String(meta.pagination?.pageSize ?? pageSize),
      "X-Page-Count": String(meta.pagination?.pageCount ?? 1),
    },
  });
}
