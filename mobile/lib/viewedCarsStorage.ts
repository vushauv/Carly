import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CarCard } from "./models";

const KEY_PREFIX = "carly.carDetails.v1.";

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
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

export async function saveCarDetailsForId(car: CarCard): Promise<void> {
  await writeJson(`${KEY_PREFIX}${car.id}`, car);
}

export async function getCarDetailsForId(id: string): Promise<CarCard | null> {
  return await readJson<CarCard | null>(`${KEY_PREFIX}${id}`, null);
}
