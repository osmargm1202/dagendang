import { NextRequest, NextResponse } from "next/server";
import { getAdvertisements } from "@/app/lib/content";

const POSITION_ALIASES: Record<string, string[]> = {
  header: ["header"],
  home_left: ["home_left"],
  home_middle: ["home_middle"],
  sidebar_top: ["sidebar_top"],
  sidebar_bottom: ["sidebar_bottom"],
  article_sidebar: ["article_sidebar"],
  content_middle: ["content_middle"],
};

const MAX_ADS_PER_POSITION = 10;

export async function GET(request: NextRequest) {
  const position = request.nextUrl.searchParams.get("position") || undefined;

  try {
    const requestedPositions = position ? POSITION_ALIASES[position] || [position] : [undefined];
    const results = await Promise.all(requestedPositions.map((item) => getAdvertisements(item, MAX_ADS_PER_POSITION)));
    const ads = results.flat().slice(0, MAX_ADS_PER_POSITION);

    return NextResponse.json(
      ads.flatMap((ad) =>
        ad.images.map((imageUrl, index) => ({
          id: `${ad.documentId}-${index}`,
          title: ad.title,
          image_url: imageUrl,
          link_url: ad.linkUrl || "#",
          position: ad.position,
          rotation_seconds: ad.rotationSeconds || 5,
          advertiser_name: ad.advertiserName,
          site_name: ad.siteName,
          site_url: ad.siteUrl,
          contact_name: ad.contactName,
          contact_phone: ad.contactPhone,
        })),
      ),
    );
  } catch (error) {
    console.error("Error fetching Strapi advertisements:", error);
    return NextResponse.json([]);
  }
}
