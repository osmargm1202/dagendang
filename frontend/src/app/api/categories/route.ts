import { NextResponse } from "next/server";
import { getCategories } from "@/app/lib/content";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching Strapi categories:", error);
    return NextResponse.json([], { status: 200 });
  }
}
