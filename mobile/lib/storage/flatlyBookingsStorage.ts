// mobile/lib/storage/flatlyBookingsStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FlatCard } from "./models";
import { getProfile } from "./profileStorage";

/**
 * Legacy global key (BAD): shared across all users on device.
 * We'll delete this on login/register so new accounts start empty.
 */
const LEGACY_KEY = "carly.flatlyBookings.v1";

/**
 * New per-user key
 */
function keyForUser(userKey: string) {
  return `carly.user.${userKey}.flatlyBookings.v1`;
}

async function getUserKey(): Promise<string> {
  const p = await getProfile();

    const email = String(p.email ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, "");

    // If backend userId is unreliable (mock), include email to avoid cross-user leaks.
    if (p.userId && email) return `id_${p.userId}_${email}`;
    if (p.userId) return `id_${p.userId}`;
    if (email) return `email_${email}`;

    return "anon";
}

export async function purgeLegacyFlatlyBookingsGlobalKey(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_KEY);
}

export type FlatlyBookingStatus = "CREATED" | "CANCELLED" | "COMPLETED";

export type FlatlyBookingRecord = {
  flatBookingId: number;
  flatId: number;

  dateFromDayISO: string;
  dateToDayISO: string;

  status: FlatlyBookingStatus;

  flatSnapshot?: Pick<
    FlatCard,
    "title" | "addressLine" | "city" | "imageUrls" | "currency" | "pricePerNight"
  >;

  createdAtISO: string;
  cancelledAtISO?: string;
};

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

export async function getFlatlyBookings(): Promise<FlatlyBookingRecord[]> {
  const userKeyStr = await getUserKey();
  const items = await readJson<FlatlyBookingRecord[]>(keyForUser(userKeyStr), []);
  return Array.isArray(items) ? items : [];
}

export async function addFlatlyBooking(
  rec: Omit<FlatlyBookingRecord, "createdAtISO" | "status">
): Promise<void> {
  const userKeyStr = await getUserKey();
  const now = new Date().toISOString();

  const current = await getFlatlyBookings();

  // ✅ Dedup by booking id (fixes duplicate React keys + mock backend reusing ids)
  const without = current.filter((b) => b.flatBookingId !== rec.flatBookingId);

  const next: FlatlyBookingRecord[] = [
    { ...rec, createdAtISO: now, status: "CREATED" },
    ...without,
  ];

  await writeJson(keyForUser(userKeyStr), next);
}

export async function markFlatlyCancelled(flatBookingId: number): Promise<void> {
  const userKeyStr = await getUserKey();
  const now = new Date().toISOString();

  const current = await getFlatlyBookings();
  const next = current.map((b) =>
    b.flatBookingId === flatBookingId
      ? { ...b, status: "CANCELLED", cancelledAtISO: now }
      : b
  );

  await writeJson(keyForUser(userKeyStr), next);
}

export async function clearFlatlyBookings(): Promise<void> {
  const userKeyStr = await getUserKey();
  await AsyncStorage.removeItem(keyForUser(userKeyStr));
}
