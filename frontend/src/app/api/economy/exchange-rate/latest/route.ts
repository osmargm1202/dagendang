import { NextResponse } from "next/server";
import { getExchangeRateData } from "@/app/lib/economy";

export async function GET() {
  const data = await getExchangeRateData();
  return NextResponse.json(data, { status: data ? 200 : 502 });
}
