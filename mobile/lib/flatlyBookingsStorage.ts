//lib/flatlyBookingsStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FlatCard } from "./models";

const KEY = "carly.flatlyBookings.v1";

export type FlatlyBookingStatus = "CREATED" | "CANCELLED" | "COMPLETED";

export type FlatlyBookingRecord = {
  flatBookingId: number;
  flatId: number;

  // UI-friendly
  dateFromDayISO: string;
  dateToDayISO: string;

  status: FlatlyBookingStatus;

  // Snapshot for Home list rendering (avoid refetching for basic display)
  flatSnapshot?: Pick<FlatCard, "title" | "addressLine" | "city" | "imageUrls" | "currency" | "pricePerNight">;

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
  const items = await readJson<FlatlyBookingRecord[]>(KEY, []);
  return Array.isArray(items) ? items : [];
}

export async function addFlatlyBooking(rec: Omit<FlatlyBookingRecord, "createdAtISO" | "status">): Promise<void> {
  const now = new Date().toISOString();
  const current = await getFlatlyBookings();
  const next: FlatlyBookingRecord[] = [
    { ...rec, createdAtISO: now, status: "CREATED" },
    ...current,
  ];
  await writeJson(KEY, next);
}

export async function markFlatlyCancelled(flatBookingId: number): Promise<void> {
  const now = new Date().toISOString();
  const current = await getFlatlyBookings();
  const next = current.map((b) =>
    b.flatBookingId === flatBookingId
      ? { ...b, status: "CANCELLED", cancelledAtISO: now }
      : b
  );
  await writeJson(KEY, next);
}
