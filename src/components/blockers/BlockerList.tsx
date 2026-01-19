"use client";

import { useEffect, useMemo, useState } from "react";

type Maintenance = {
  id: string;
  from: string;
  to: string;
  type: string;
  description?: string;
  unit?: { id?: string };
};

type ApiOk = {
  ok: true;
  data: {
    maintenances: Maintenance[];
    count?: number;
  };
};

type ApiErr = { ok: false; error: string };

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function BlockerList({
  refreshKey = 0,
  onChanged,
}: {
  refreshKey?: number;
  onChanged?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/blockers", { cache: "no-store" });
        const json = (await res.json()) as ApiOk | ApiErr;

        if (!json.ok) throw new Error(json.error);

        setMaintenances(json.data.maintenances ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey]);

  const countLabel = useMemo(() => {
    if (loading) return "";
    if (error) return "";
    return `${maintenances.length} blocker(s)`;
  }, [loading, error, maintenances.length]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        Loading blockers from Apaleo…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Failed to load blockers: {error}
      </div>
    );
  }

  if (maintenances.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-600">
        No blockers yet. Create one above.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">{countLabel}</div>

      {maintenances.map((m) => (
        <div
          key={m.id}
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {formatDateTime(m.from)} → {formatDateTime(m.to)}
              </span>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                {m.type}
              </span>
            </div>

            <p className="mt-1 truncate text-sm text-gray-600">
              Reason:{" "}
              <span className="text-gray-900">
                {m.description?.trim() ? m.description : "—"}
              </span>
            </p>

            <p className="mt-1 text-xs text-gray-500">
              ID: <span className="font-mono">{m.id}</span>
              {m.unit?.id ? (
                <>
                  {"  "}• Unit: <span className="font-mono">{m.unit.id}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border text-green-500 border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={async () => {
                const newReason = prompt(
                  "New reason/description:",
                  m.description ?? ""
                );
                if (newReason === null) return;

                const res = await fetch(`/api/blockers/${m.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ description: newReason }),
                });

                const json = await res.json();
                if (!json.ok) {
                  alert(`Edit failed: ${json.error}`);
                  return;
                }

                onChanged?.();
              }}
            >
              Edit
            </button>

            <button
              type="button"
              className="rounded-xl border text-red-500 border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={async () => {
                const ok = confirm("Delete this blocker?");
                if (!ok) return;

                const res = await fetch(`/api/blockers/${m.id}`, {
                  method: "DELETE",
                });
                console.log("m.id: ", m.id);
                const json = await res.json();

                if (!json.ok) {
                  alert(`Delete failed: ${json.error}`);
                  return;
                }

                onChanged?.();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
