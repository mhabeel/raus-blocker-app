
import type { Blocker } from "@/lib/types";

export const dummyBlockers: Blocker[] = [
  {
    id: "b1",
    startDate: "2026-02-10",
    endDate: "2026-02-14",
    reason: "Vacation",
    status: "OutOfInventory",
    createdAt: new Date().toISOString(),
  },
  {
    id: "b2",
    startDate: "2026-03-01",
    endDate: "2026-03-02",
    reason: "Deep cleaning",
    status: "OutOfOrder",
    createdAt: new Date().toISOString(),
  },
];
