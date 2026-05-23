import { NextResponse } from "next/server";
import { getFuelPriceData } from "@/app/lib/economy";

export async function GET() {
  const data = await getFuelPriceData();
  return NextResponse.json(data, { status: data ? 200 : 502 });
}
