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
