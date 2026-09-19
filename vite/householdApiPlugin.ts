import type { IncomingMessage, ServerResponse } from "node:http";

import type { Plugin } from "vite";

import {
  householdApiPath,
  isHouseholdSnapshot,
  isHouseholdToken,
} from "../src/store/household.ts";
import type { HouseholdSnapshot } from "../src/types.ts";

const households = new Map<string, HouseholdSnapshot>();

const readBody = (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    request.on("error", reject);
  });

const sendJson = (
  response: ServerResponse,
  status: number,
  body: unknown,
): void => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
};

const tokenFromUrl = (url: string): string | null => {
  const path = url.split("?")[0] ?? "";
  const prefix = householdApiPath("");
  if (!path.startsWith(prefix)) {
    return null;
  }

  const token = path.slice(prefix.length).replace(/\/$/, "");
  return isHouseholdToken(token) ? token : null;
};

const handleHouseholdRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean> => {
  const url = request.url ?? "";
  if (!url.startsWith("/api/household/")) {
    return false;
  }

  const token = tokenFromUrl(url);
  if (!token) {
    sendJson(response, 400, { error: "invalid_token" });
    return true;
  }

  if (request.method === "GET") {
    const snapshot = households.get(token);
    if (!snapshot) {
      sendJson(response, 404, { error: "not_found" });
      return true;
    }

    sendJson(response, 200, snapshot);
    return true;
  }

  if (request.method === "PUT") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readBody(request));
    } catch {
      sendJson(response, 400, { error: "invalid_json" });
      return true;
    }

    if (!isHouseholdSnapshot(parsed)) {
      sendJson(response, 400, { error: "invalid_snapshot" });
      return true;
    }

    households.set(token, parsed);
    sendJson(response, 200, parsed);
    return true;
  }

  response.statusCode = 405;
  response.setHeader("Allow", "GET, PUT");
  response.end();
  return true;
};

export const householdApiPlugin = (): Plugin => ({
  name: "household-api",
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      void handleHouseholdRequest(request, response).then((handled) => {
        if (!handled) {
          next();
        }
      }, next);
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((request, response, next) => {
      void handleHouseholdRequest(request, response).then((handled) => {
        if (!handled) {
          next();
        }
      }, next);
    });
  },
});
