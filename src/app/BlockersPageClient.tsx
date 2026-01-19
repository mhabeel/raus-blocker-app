"use client";

import { useState } from "react";
import BlockerForm from "@/components/blockers/BlockerForm";
import BlockerList from "@/components/blockers/BlockerList";

export default function BlockersPageClient() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg text-black font-semibold">Create a new blocker</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pick dates and add a reason (e.g. Vacation).
        </p>
        <div className="mt-5">
          <BlockerForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg text-black font-semibold">Existing blockers</h2>
        <p className="mt-1 text-sm text-gray-600">
          These are the currently saved blocker periods.
        </p>
        <div className="mt-5">
          <BlockerList refreshKey={refreshKey} onChanged={() => setRefreshKey((k) => k + 1)} />

        </div>
      </section>
    </div>
  );
}
