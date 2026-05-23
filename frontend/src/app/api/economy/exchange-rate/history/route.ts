import { NextResponse } from "next/server";
import { getExchangeRateHistory } from "@/app/lib/economy";

export async function GET() {
  const data = await getExchangeRateHistory();
  return NextResponse.json(data);
}
