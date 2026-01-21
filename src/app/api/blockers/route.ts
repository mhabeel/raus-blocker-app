import { NextResponse } from "next/server";
import { apaleoFetch } from "@/lib/apaleoClient";

export async function GET(request: Request) {
  try {
    const propertyId = process.env.APALEO_PROPERTY_ID ?? "DEVTEST";

    const qs = new URLSearchParams({ propertyId });
    const path = `/operations/v1/maintenances?${qs.toString()}`;
    console.log("Calling Apaleo:", path);

    const res = await apaleoFetch(path);
    const data = await res.json();

    const unitIds: string[] = Array.from(
      new Set(
        (data?.maintenances ?? [])
          .map((m: any) => m?.unit?.id ?? m?.unitId ?? null)
          .filter(Boolean)
      )
    );

    return NextResponse.json({ ok: true, data, unitIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const id = process.env.APALEO_PROPERTY_ID ?? "DEVTEST";
    // const unitId = process.env.APALEO_UNIT_ID;

    const body = await request.json();
    const { startDate, endDate, reason, type, unitId } = body as {
      startDate: string;
      endDate: string;
      reason: string;
      type: "OutOfInventory" | "OutOfOrder";
      unitId: string;
    };

    if (!unitId) {
      return NextResponse.json(
        { ok: false, error: "Missing APALEO_UNIT_ID in .env.local" },
        { status: 500 }
      );
    }

    if (!startDate || !endDate || !reason?.trim() || !type) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing fields: startDate, endDate, reason, type",
        },
        { status: 400 }
      );
    }
    if (endDate < startDate) {
      return NextResponse.json(
        { ok: false, error: "endDate must be >= startDate" },
        { status: 400 }
      );
    }

    const from = `${startDate}T15:00:00+01:00`;
    const to = `${endDate}T11:00:00+01:00`;

    const payload = {
      unitId,
      from,
      to,
      type,
      description: reason,
    };

    const res = await apaleoFetch("/operations/v1/maintenances", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const created = await res.json();
    return NextResponse.json({ ok: true, created });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
