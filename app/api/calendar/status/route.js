import { calendarConnectionStatus } from "@/lib/googleCalendar";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(await calendarConnectionStatus());
}

