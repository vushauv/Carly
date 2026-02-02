// lib/profileStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PROFILE = "carly.profile.v4";

export type Profile = {
  userId?: number; // <-- new
  email: string;
  phoneDigits: string; // store only digits, e.g. "123456789"
  fullName: string;
};

const DEFAULT_PROFILE: Profile = {
  userId: undefined,
  email: "",
  phoneDigits: "",
  fullName: "",
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

export async function getProfile(): Promise<Profile> {
  const p = await readJson<Partial<Profile>>(KEY_PROFILE, DEFAULT_PROFILE);
  return { ...DEFAULT_PROFILE, ...(p ?? {}) };
}

export async function saveProfile(profile: Profile): Promise<void> {
  await writeJson(KEY_PROFILE, profile);
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PROFILE);
}
