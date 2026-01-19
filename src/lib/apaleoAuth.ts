// src/lib/apaleoAuth.ts

type TokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope?: string;
};

let cachedToken: { token: string; expiresAtMs: number } | null = null;

export async function getApaleoAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAtMs) {
    return cachedToken.token;
  }

  const clientId = process.env.APALEO_CLIENT_ID;
  const clientSecret = process.env.APALEO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing APALEO_CLIENT_ID or APALEO_CLIENT_SECRET in .env.local"
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://identity.apaleo.com/connect/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),

    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as TokenResponse;

  const bufferSeconds = 30;
  cachedToken = {
    token: data.access_token,
    expiresAtMs: Date.now() + (data.expires_in - bufferSeconds) * 1000,
  };

  return data.access_token;
}
