// mobile/lib/storage/flatlyBookingsStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "./profileStorage";

export type FlatlyBookingLocalStatus = "CREATED" | "CANCELLED";

export type FlatlyBookingSnapshot = {
  title: string;
  addressLine: string;
  city: string;
  country?: string;
  imageUrls: string[];
};

export type FlatlyBookingRecord = {
  flatBookingId: string; // uuid (string)
  dateFromDayISO: string; // YYYY-MM-DD
  dateToDayISO: string; // YYYY-MM-DD

  status: FlatlyBookingLocalStatus;
  createdAtISO: string;
  cancelledAtISO?: string;

  flatSnapshot?: FlatlyBookingSnapshot;
};

/**
 * Legacy global key (BAD): shared across all users on device.
 */
const LEGACY_KEY = "carly.flatlyBookings.v1";

/**
 * New per-user key
 */
function keyForUser(userKey: string) {
  return `carly.user.${userKey}.flatlyBookings.v2`; // bump version (uuid switch)
}

async function getUserKey(): Promise<string> {
  const p = await getProfile();

  const email = String(p.email ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, "");

  if (p.userId && email) return `id_${p.userId}_${email}`;
  if (p.userId) return `id_${p.userId}`;
  if (email) return `email_${email}`;

  return "anon";
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function purgeLegacyFlatlyBookingsGlobalKey(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_KEY);
}

export async function getFlatlyBookings(): Promise<FlatlyBookingRecord[]> {
  const userKeyStr = await getUserKey();
  const items = await readJson<FlatlyBookingRecord[]>(keyForUser(userKeyStr), []);
  return Array.isArray(items) ? items : [];
}

export async function upsertFlatlyBooking(rec: Omit<FlatlyBookingRecord, "createdAtISO" | "status">): Promise<void> {
  const userKeyStr = await getUserKey();
  const now = new Date().toISOString();

  const current = await getFlatlyBookings();
  const without = current.filter((b) => b.flatBookingId !== rec.flatBookingId);

  const next: FlatlyBookingRecord[] = [
    {
      ...rec,
      status: "CREATED",
      createdAtISO: now,
    },
    ...without,
  ];

  await writeJson(keyForUser(userKeyStr), next);
}

export async function markFlatlyCancelled(flatBookingId: string): Promise<void> {
  const id = String(flatBookingId ?? "").trim();
  if (!id) return;

  const userKeyStr = await getUserKey();
  const now = new Date().toISOString();

  const current = await getFlatlyBookings();

  // If we don't have it yet, create a minimal record so it doesn't disappear.
  const exists = current.some((b) => b.flatBookingId === id);

  const next: FlatlyBookingRecord[] = (exists ? current : [
    {
      flatBookingId: id,
      dateFromDayISO: "—",
      dateToDayISO: "—",
      status: "CREATED",
      createdAtISO: now,
    },
    ...current,
  ]).map((b) =>
    b.flatBookingId === id
      ? { ...b, status: "CANCELLED", cancelledAtISO: now }
      : b
  );

  await writeJson(keyForUser(userKeyStr), next);
}

export async function clearFlatlyBookings(): Promise<void> {
  const userKeyStr = await getUserKey();
  await AsyncStorage.removeItem(keyForUser(userKeyStr));
}
