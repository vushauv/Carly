// mobile/lib/storage/referenceDataStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReferenceDataDto } from "./referenceDataApi";

const KEY_REF_DATA = "carly.referenceData.v2";

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

export async function getCachedReferenceData(): Promise<ReferenceDataDto | null> {
  const v = await readJson<ReferenceDataDto | null>(KEY_REF_DATA, null);
  return v;
}

export async function setCachedReferenceData(v: ReferenceDataDto): Promise<void> {
  await writeJson(KEY_REF_DATA, v);
}

export async function clearCachedReferenceData(): Promise<void> {
  await AsyncStorage.removeItem(KEY_REF_DATA);
}
