import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ASSET_URLS = [
  process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL,
  process.env.STRAPI_API_URL,
]
  .filter(Boolean)
  .map((value) => value!.trim().replace(/^["']|["']$/g, ""));

function isAllowedAssetUrl(url: URL) {
  return ALLOWED_ASSET_URLS.some((allowed) => {
    try {
      const parsed = new URL(allowed);
      return url.protocol === parsed.protocol && url.hostname === parsed.hostname;
    } catch {
      return false;
    }
  });
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing media url" }, { status: 400 });
  }

  let mediaUrl: URL;
  try {
    mediaUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid media url" }, { status: 400 });
  }

  if (!isAllowedAssetUrl(mediaUrl)) {
    return NextResponse.json({ error: "Media host not allowed" }, { status: 400 });
  }

  try {
    const upstream = await fetch(mediaUrl, {
      cache: "force-cache",
      next: { revalidate: 3600 },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Media not found" }, { status: upstream.status || 404 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Error proxying media:", error);
    return NextResponse.json({ error: "Media proxy failed" }, { status: 502 });
  }
}
