import { NextRequest, NextResponse } from "next/server";

const FASTAPI_API_URL = process.env.FASTAPI_API_URL?.trim().replace(/^['\"]|['\"]$/g, "");

export async function GET(request: NextRequest) {
  if (!FASTAPI_API_URL) {
    return NextResponse.json([]);
  }

  const upstreamUrl = new URL("/api/ads", FASTAPI_API_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  try {
    const res = await fetch(upstreamUrl, { cache: "no-store" });
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok || !contentType.includes("application/json")) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json([]);
  }
}
