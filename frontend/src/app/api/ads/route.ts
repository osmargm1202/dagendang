import { NextRequest, NextResponse } from "next/server";
import { getAdvertisements } from "@/app/lib/content";

const POSITION_ALIASES: Record<string, string[]> = {
  header: ["header", "home_header", "top", "top_banner"],
  home_left: ["home_left", "home_side", "left", "sidebar_left"],
  home_middle: ["home_middle", "home_center", "middle", "in_content"],
  sidebar_top: ["sidebar_top", "home_side", "right", "sidebar_right"],
  sidebar_bottom: ["sidebar_bottom", "home_side", "right_bottom", "sidebar_right"],
  article_sidebar: ["article_sidebar", "article_side", "sidebar_article"],
};

export async function GET(request: NextRequest) {
  const position = request.nextUrl.searchParams.get("position") || undefined;

  try {
    const requestedPositions = position ? POSITION_ALIASES[position] || [position] : [undefined];
    const results = await Promise.all(requestedPositions.map((item) => getAdvertisements(item)));
    const ads = results.flat();

    return NextResponse.json(
      ads.flatMap((ad) =>
        ad.images.map((imageUrl, index) => ({
          id: `${ad.documentId}-${index}`,
          title: ad.title,
          image_url: imageUrl,
          link_url: ad.linkUrl || "#",
          position: ad.position,
          rotation_seconds: 5,
        })),
      ),
    );
  } catch (error) {
    console.error("Error fetching Strapi advertisements:", error);
    return NextResponse.json([]);
  }
}
