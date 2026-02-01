// lib/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CarCard } from "./models";
import { getProfile } from "./profileStorage";

/**
 * Legacy global keys (BAD): shared across all users on device.
 * We'll delete these on login/register so nothing "seeds" new accounts.
 */
const LEGACY_KEY_LIKED_CARS = "carly.likedCars.v2";
const LEGACY_KEY_DISLIKED_IDS = "carly.dislikedCarIds.v2";

/**
 * New per-user keys
 */
function keyLiked(userKey: string) {
  return `carly.user.${userKey}.likedCars.v1`;
}
function keyDisliked(userKey: string) {
  return `carly.user.${userKey}.dislikedCarIds.v1`;
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

export async function purgeLegacyCarPrefsGlobalKeys(): Promise<void> {
  // This is the key fix for "new account sees seeded likes/dislikes".
  await Promise.all([
    AsyncStorage.removeItem(LEGACY_KEY_LIKED_CARS),
    AsyncStorage.removeItem(LEGACY_KEY_DISLIKED_IDS),
  ]);
}

export type LikedCar = Pick<
  CarCard,
  | "id"
  | "title"
  | "subtitle"
  | "imageUrl"
  | "brand"
  | "model"
  | "fuelType"
  | "color"
  | "currency"
  | "pricePerDay"
>;

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

async function readSet(key: string): Promise<Set<string>> {
  const arr = await readJson<unknown>(key, []);
  if (!Array.isArray(arr)) return new Set<string>();
  return new Set(arr.filter((x) => typeof x === "string") as string[]);
}

async function writeSet(key: string, set: Set<string>): Promise<void> {
  await writeJson(key, Array.from(set));
}

// -------------------------
// Likes (store car objects)
// -------------------------
export async function getLikedCars(): Promise<LikedCar[]> {
  const userKeyStr = await getUserKey();
  const cars = await readJson<LikedCar[]>(keyLiked(userKeyStr), []);
  return Array.isArray(cars) ? cars : [];
}

export async function getLikedCarIds(): Promise<Set<string>> {
  const cars = await getLikedCars();
  return new Set(cars.map((c) => c.id));
}

export async function addLikedCar(car: CarCard): Promise<void> {
  const userKeyStr = await getUserKey();
  const current = await getLikedCars();

  const liked: LikedCar = {
    id: car.id,
    title: car.title,
    subtitle: car.subtitle,
    imageUrl: car.imageUrl,
    brand: car.brand,
    model: car.model,
    fuelType: car.fuelType,
    color: car.color,
    currency: car.currency,
    pricePerDay: car.pricePerDay,
  };

  // Dedup by id, newest first
  const without = current.filter((c) => c.id !== liked.id);

  // ✅ correct spread (your current code has `[liked, .without]` which is broken) :contentReference[oaicite:1]{index=1}
  await writeJson(keyLiked(userKeyStr), [liked, ...without]);
}

export async function removeLikedCar(carId: string): Promise<void> {
  const userKeyStr = await getUserKey();
  const current = await getLikedCars();
  await writeJson(
    keyLiked(userKeyStr),
    current.filter((c) => c.id !== carId)
  );
}

export async function clearLikedCars(): Promise<void> {
  const userKeyStr = await getUserKey();
  await AsyncStorage.removeItem(keyLiked(userKeyStr));
}

// -------------------------
// Dislikes (ids only)
// -------------------------
export async function getDislikedCarIds(): Promise<Set<string>> {
  const userKeyStr = await getUserKey();
  return readSet(keyDisliked(userKeyStr));
}

export async function addDislikedCarId(carId: string): Promise<void> {
  const userKeyStr = await getUserKey();
  const set = await readSet(keyDisliked(userKeyStr));
  set.add(carId);
  await writeSet(keyDisliked(userKeyStr), set);
}

export async function clearDislikedCarIds(): Promise<void> {
  const userKeyStr = await getUserKey();
  await AsyncStorage.removeItem(keyDisliked(userKeyStr));
}
