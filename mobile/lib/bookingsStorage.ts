import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_BOOKINGS = "carly.bookings.v1";

export type BookingStatus = "current" | "history";
export type BookingState = "Booked" | "Cancelled";

export type BookingCar = {
  brand: string;
  model: string;
  plate: string;
  images: string[];
};

export type BookingFlat = {
  address: string;
  images: string[];
};

export type Booking = {
  id: string;
  status: BookingStatus;   // controls current/history list
  state: BookingState;     // Booked/Cancelled label
  startDate: string;
  endDate: string;
  car?: BookingCar;
  flat?: BookingFlat;
  rating?: number;
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

export async function getBookings(): Promise<Booking[]> {
  const items = await readJson<Booking[]>(KEY_BOOKINGS, []);
  return Array.isArray(items) ? items : [];
}

export async function seedBookingsIfEmpty(seed: Booking[]): Promise<void> {
  const existing = await getBookings();
  if (existing.length > 0) return;
  await writeJson(KEY_BOOKINGS, seed);
}

export async function addBooking(b: Booking): Promise<void> {
  const current = await getBookings();
  await writeJson(KEY_BOOKINGS, [b, ...current]);
}

export async function updateBooking(id: string, patch: Partial<Booking>): Promise<void> {
  const current = await getBookings();
  const next = current.map((b) => (b.id === id ? { ...b, ...patch } : b));
  await writeJson(KEY_BOOKINGS, next);
}

export async function cancelBooking(id: string): Promise<void> {
  const now = new Date().toISOString();
  await updateBooking(id, {
    status: "history",
    state: "Cancelled",
    cancelledAtISO: now,
    rating: undefined,
  });
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const items = await getBookings();
  return items.find((b) => b.id === id) ?? null;
}
