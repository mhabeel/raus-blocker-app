"use client";

import { useEffect, useMemo, useState } from "react";

type UnitsApiResponse =
  | { ok: true; unitIds: string[] }
  | { ok: false; error: string };

export default function BlockerForm({ onCreated }: { onCreated?: () => void }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"OutOfInventory" | "OutOfOrder">(
    "OutOfInventory"
  );

  const [unitIds, setUnitIds] = useState<string[]>([]);
  const [unitId, setUnitId] = useState<string>("");

  const [message, setMessage] = useState<string | null>(null);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    async function loadUnitIds() {
      try {
        setLoadingUnits(true);
        const res = await fetch("/api/blockers", { cache: "no-store" });
        const json = (await res.json()) as UnitsApiResponse;

        if (!json.ok) throw new Error(json.error);

        const ids = json.unitIds ?? [];
        setUnitIds(ids);

        if (!unitId && ids.length > 0) setUnitId(ids[0]);
      } catch (e) {
        setMessage(
          `⚠️ Could not load unitIds: ${e instanceof Error ? e.message : "Unknown error"}`
        );
      } finally {
        setLoadingUnits(false);
      }
    }

    loadUnitIds();
  }, []);

  const isValid = useMemo(() => {
    if (!unitId) return false;
    if (!startDate || !endDate || !reason.trim()) return false;
    return endDate >= startDate;
  }, [unitId, startDate, endDate, reason]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!isValid) {
      setMessage("Please fill all fields (including unit) and check the dates.");
      return;
    }

    try {
      const res = await fetch("/api/blockers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          startDate,
          endDate,
          reason,
          type: status,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        throw new Error(json.error ?? "Failed to create blocker");
      }

      setMessage("✅ Blocker created in Apaleo.");

      setStartDate("");
      setEndDate("");
      setReason("");
      setStatus("OutOfInventory");

      onCreated?.();
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Unit selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Unit (Cabin)
        </label>

        <select
          className="mt-1 w-full rounded-xl border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          disabled={loadingUnits || unitIds.length === 0}
          required
        >
          {unitIds.length === 0 ? (
            <option value="">
              {loadingUnits ? "Loading units..." : "No unit IDs found"}
            </option>
          ) : (
            unitIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))
          )}
        </select>

        <p className="mt-1 text-xs text-gray-500">
          Units are currently discovered from existing maintenances.
        </p>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start date
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            We apply 15:00 as start time.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End date
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            We apply 11:00 as end time.
          </p>
        </div>
      </div>

      {/* Type + Reason */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Blocker type
          </label>
          <select
            className="mt-1 w-full rounded-xl border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "OutOfInventory" | "OutOfOrder")
            }
          >
            <option value="OutOfInventory">Out of Inventory (Vacation)</option>
            <option value="OutOfOrder">Out of Order (Repair)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason
          </label>
          <input
            type="text"
            placeholder='e.g. "Vacation"'
            className="mt-1 w-full rounded-xl border text-gray-500 border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isValid}
          className="rounded-xl bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          Create blocker
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
          {message}
        </div>
      )}
    </form>
  );
}
