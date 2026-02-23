//  mobile/lib/api/apiClient.ts
import { Platform } from "react-native";

//const CARLY_API_URL = "http://192.168.1.29:8080";
const CARLY_API_URL = "https://carlyapi.azurewebsites.net";

function pickBaseUrl(): string {
  if (__DEV__) {
    if (Platform.OS === "ios") {
      return CARLY_API_URL;
    }

    return CARLY_API_URL;
    //return "http://10.0.2.2:8080";
  }

  // production fallback (adjust later)
  return CARLY_API_URL;
}

export const API_BASE_URL = pickBaseUrl();

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function tryParseJson(text: string): Promise<unknown | null> {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 15000, ...init } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    const text = await res.text();
    const maybeJson = await tryParseJson(text);

    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" &&
          maybeJson &&
          "message" in (maybeJson as any) &&
          String((maybeJson as any).message)) ||
        (text ? text : `HTTP ${res.status}`);
      throw new ApiError(msg, res.status, maybeJson ?? text);
    }

    if (!text) return undefined as T;
    return (maybeJson ?? text) as T;
  } finally {
    clearTimeout(id);
  }
}
