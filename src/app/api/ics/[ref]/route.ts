import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { buildIcs } from "@/lib/domain/ics";

export async function GET(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const token = new URL(req.url).searchParams.get("t") ?? "";
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return new NextResponse("Not configured", { status: 503 });
  const b = await fetchQuery(api.public.bookingByReference, { reference: ref, token });
  if (!b) return new NextResponse("Not found", { status: 404 });
  const ics = buildIcs({
    reference: b.reference,
    title: `${b.serviceName} with Sonia Brown`,
    description: `Booking ${b.reference} · ${b.guests} guests. Questions? WhatsApp https://wa.me/${b.whatsapp}`,
    location: b.address,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
  });
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="sonia-brown-${b.reference}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
