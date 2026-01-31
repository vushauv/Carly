//lib/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CarCard } from "./models";

const KEY_LIKED_CARS = "carly.likedCars.v2";
const KEY_DISLIKED_IDS = "carly.dislikedCarIds.v2";

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

// -------------------------
// Likes (store car objects)
// -------------------------
export async function getLikedCars(): Promise<LikedCar[]> {
  const cars = await readJson<LikedCar[]>(KEY_LIKED_CARS, []);
  return Array.isArray(cars) ? cars : [];
}

export async function getLikedCarIds(): Promise<Set<string>> {
  const cars = await getLikedCars();
  return new Set(cars.map((c) => c.id));
}

export async function addLikedCar(car: CarCard): Promise<void> {
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
  await writeJson(KEY_LIKED_CARS, [liked, ...without]);
}

export async function removeLikedCar(carId: string): Promise<void> {
  const current = await getLikedCars();
  await writeJson(
    KEY_LIKED_CARS,
    current.filter((c) => c.id !== carId)
  );
}

export async function clearLikedCars(): Promise<void> {
  await AsyncStorage.removeItem(KEY_LIKED_CARS);
}

// -------------------------
// Dislikes (ids only)
// -------------------------
async function readSet(key: string): Promise<Set<string>> {
  const arr = await readJson<unknown>(key, []);
  if (!Array.isArray(arr)) return new Set<string>();
  return new Set(arr.filter((x) => typeof x === "string") as string[]);
}

async function writeSet(key: string, set: Set<string>): Promise<void> {
  await writeJson(key, Array.from(set));
}

export async function getDislikedCarIds(): Promise<Set<string>> {
  return readSet(KEY_DISLIKED_IDS);
}

export async function addDislikedCarId(carId: string): Promise<void> {
  const set = await readSet(KEY_DISLIKED_IDS);
  set.add(carId);
  await writeSet(KEY_DISLIKED_IDS, set);
}

export async function clearDislikedCarIds(): Promise<void> {
  await AsyncStorage.removeItem(KEY_DISLIKED_IDS);
}
