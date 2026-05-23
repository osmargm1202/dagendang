import { NextRequest, NextResponse } from "next/server";
import { getFuelPriceHistory } from "@/app/lib/economy";

export async function GET(request: NextRequest) {
  const days = Number(request.nextUrl.searchParams.get("days") || 30);
  const data = await getFuelPriceHistory(Number.isFinite(days) ? days : 30);
  return NextResponse.json(data);
}
