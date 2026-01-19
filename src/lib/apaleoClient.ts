import { getApaleoAccessToken } from "@/lib/apaleoAuth";

const APALEO_API_BASE = "https://api.apaleo.com";

export async function apaleoFetch(path: string, init?: RequestInit) {
  const token = await getApaleoAccessToken();

  const res = await fetch(`${APALEO_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },

    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apaleo API error (${res.status}) on ${path}: ${text}`);
  }

  return res;
}
