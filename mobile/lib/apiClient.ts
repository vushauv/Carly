// lib/apiClient.ts
import { Platform } from "react-native";

// ✅ SET THIS to your PC IP when running Expo on a real iPhone.
const DEV_MACHINE_IP = "http://192.168.1.29:8080";

function pickBaseUrl(): string {
  // If you're on iOS SIMULATOR, localhost works.
  // If you're on a PHYSICAL iPhone, localhost does NOT work.
  if (__DEV__) {
    if (Platform.OS === "ios") {
      // If you are using a physical iPhone with Expo Go, use your PC IP:
      return DEV_MACHINE_IP;

      // If you are using iOS simulator, you can use:
      // return "http://localhost:8080";
    }

    // Android emulator special-case:
    return "http://10.0.2.2:8080";
  }

  // production fallback (adjust later)
  return DEV_MACHINE_IP;
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
