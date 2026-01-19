import { NextResponse } from "next/server";
import { apaleoFetch } from "@/lib/apaleoClient";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

async function getId(ctx: Ctx): Promise<string | undefined> {
  const p: any = (ctx as any).params;
  if (!p) return undefined;
  // If params is a Promise, await it; otherwise use it directly
  const resolved = typeof p.then === "function" ? await p : p;
  return resolved?.id;
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const maintenanceId = await getId(ctx);

    console.log("URL:", request.url);
    console.log("maintenanceId:", maintenanceId);

    if (!maintenanceId || maintenanceId === "undefined") {
      return NextResponse.json(
        { ok: false, error: "Invalid maintenance id (missing/undefined)" },
        { status: 400 }
      );
    }

    const path = `/operations/v1/maintenances/${encodeURIComponent(
      maintenanceId
    )}`;
    console.log("Apaleo DELETE:", path);

    const res = await apaleoFetch(path, { method: "DELETE" });
    const text = await res.text().catch(() => "");

    return NextResponse.json({ ok: true, result: text || "deleted" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const maintenanceId = await getId(ctx);

    if (!maintenanceId || maintenanceId === "undefined") {
      return NextResponse.json(
        { ok: false, error: "Invalid maintenance id (missing/undefined)" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const patch: Array<{ op: "replace"; path: string; value: any }> = [];

    if (body.from)
      patch.push({ op: "replace", path: "/from", value: body.from });
    if (body.to) patch.push({ op: "replace", path: "/to", value: body.to });
    if (body.type)
      patch.push({ op: "replace", path: "/type", value: body.type });
    if (body.description !== undefined)
      patch.push({
        op: "replace",
        path: "/description",
        value: body.description,
      });

    if (patch.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const path = `/operations/v1/maintenances/${encodeURIComponent(
      maintenanceId
    )}`;

    const res = await apaleoFetch(path, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json-patch+json",
      },
      body: JSON.stringify(patch),
    });

    const text = await res.text();
    const updated = text ? JSON.parse(text) : null;
    return NextResponse.json({ ok: true, updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
