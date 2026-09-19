import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import {
  isHouseholdSnapshot,
  isHouseholdToken,
} from "../../src/store/household.ts";

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

const tokenFromRequest = (request: Request): string | null => {
  const path = new URL(request.url).pathname;
  const match = path.match(/\/household\/([A-Za-z0-9]+)\/?$/);
  const token = match?.[1];
  return token && isHouseholdToken(token) ? token : null;
};

export default async (request: Request): Promise<Response> => {
  const token = tokenFromRequest(request);
  if (!token) {
    return jsonResponse(400, { error: "invalid_token" });
  }

  const store = getStore("households");

  if (request.method === "GET") {
    const snapshot = await store.get(token, { type: "json" });
    if (snapshot === null) {
      return jsonResponse(404, { error: "not_found" });
    }

    if (!isHouseholdSnapshot(snapshot)) {
      return jsonResponse(404, { error: "not_found" });
    }

    return jsonResponse(200, snapshot);
  }

  if (request.method === "PUT") {
    let parsed: unknown;
    try {
      parsed = await request.json();
    } catch {
      return jsonResponse(400, { error: "invalid_json" });
    }

    if (!isHouseholdSnapshot(parsed)) {
      return jsonResponse(400, { error: "invalid_snapshot" });
    }

    await store.setJSON(token, parsed);
    return jsonResponse(200, parsed);
  }

  return new Response(null, {
    status: 405,
    headers: { Allow: "GET, PUT" },
  });
};

export const config: Config = {
  path: "/api/household/:token",
};
