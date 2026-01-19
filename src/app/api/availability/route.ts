import { NextResponse } from "next/server";
import { apaleoFetch } from "@/lib/apaleoClient";

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function GET(request: Request) {
  try {
    const propertyId = process.env.APALEO_PROPERTY_ID ?? "DEVTEST";
    const url = new URL(request.url);

    const startDate = url.searchParams.get("startDate"); // YYYY-MM-DD
    const endDate = url.searchParams.get("endDate");     // YYYY-MM-DD
    if (!startDate || !endDate) {
      return NextResponse.json(
        { ok: false, error: "Missing startDate or endDate" },
        { status: 400 }
      );
    }

    // ✅ Apaleo wants capitalized From/To
    const qs = new URLSearchParams({
      propertyId,
      From: startDate, // date-only
      To: endDate,     // date-only
    });

    const path = `/availability/v1/unit-groups?${qs.toString()}`;
    console.log("Availability call:", path);

    const res = await apaleoFetch(path);
    console.log("Status:", res.status, "Content-Type:", res.headers.get("content-type"));

    const data = await safeReadJson(res);

    if (!data) {
      return NextResponse.json({
        ok: true,
        sent: { propertyId, From: startDate, To: endDate },
        apaleoStatus: res.status,
        warning: "Apaleo returned empty response body",
      });
    }

    const unitGroups = (data as any)?.unitGroups ?? [];
    const totalAvailable = unitGroups.reduce(
      (sum: number, ug: any) => sum + (ug.availableCount ?? 0),
      0
    );

    return NextResponse.json({
      ok: true,
      sent: { propertyId, From: startDate, To: endDate },
      totalAvailable,
      isAvailable: totalAvailable > 0,
      unitGroups,
      raw: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
