//mobile/app/register.tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { saveProfile } from "../lib/storage/profileStorage";
import { registerUser, getUserById } from "../lib/api/userApi";
import { ApiError } from "../lib/api/apiClient";
import { clearCachedReferenceData } from "../lib/storage/referenceDataStorage";
import { resetSearchLookupsMemo } from "../lib/api/carlyApi";
import { purgeLegacyCarPrefsGlobalKeys } from "../lib/storage/storage";
import { purgeLegacyFlatlyBookingsGlobalKey } from "../lib/storage/flatlyBookingsStorage";

function onlyDigits(s: string): string {
  return (s || "").replace(/\D/g, "");
}

function formatPhone(digits: string): string {
  const d = onlyDigits(digits).slice(0, 9);
  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 9);

  if (d.length <= 3) return a;
  if (d.length <= 6) return `${a}-${b}`;
  return `${a}-${b}-${c}`;
}

function isValidEmail(email: string): boolean {
  const e = email.trim();
  if (!e) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(e);
}

function prettyApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const body =
      typeof err.body === "string"
        ? err.body
        : err.body
        ? JSON.stringify(err.body)
        : "";
    return `${err.message} (HTTP ${err.status})${body ? `\n\n${body}` : ""}`;
  }
  if (err && typeof err === "object" && "message" in err) {
    return String((err as any).message);
  }
  return "Unknown error";
}

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  const [loading, setLoading] = useState(false);

  const phoneDisplay = useMemo(() => formatPhone(phoneDigits), [phoneDigits]);

  async function onCreateAccount() {
    const e = email.trim();
    const n = name.trim();
    const s = surname.trim();
    const pDigits = onlyDigits(phoneDigits).slice(0, 9);

    if (!isValidEmail(e)) {
      Alert.alert("Invalid email", "Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (!n || !s) {
      Alert.alert("Missing info", "Please enter your name and surname.");
      return;
    }

    // ✅ Password minimum 8 characters
    if (!password || password.length < 8) {
      Alert.alert("Invalid password", "Password must be at least 8 characters.");
      return;
    }

    if (pDigits.length > 0 && pDigits.length < 9) {
      Alert.alert("Invalid phone", "Phone number must have 9 digits.");
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT: this must be POST /users/register
      // If you still don't see the backend being called, you're not on this screen/route.
      const { userId } = await registerUser({
        firstName: n,
        lastName: s,
        email: e,
        password,
        contactNumber: pDigits ? Number(pDigits) : undefined,
      });

      // ✅ Verify persistence like login does:
      // If this fails, backend did NOT store/commit the user.
      const info = await getUserById(userId);

      await saveProfile({
        userId,
        email: info.email ?? e,
        phoneDigits: info.contactNumber ? String(info.contactNumber) : "",
        firstName: info.firstName ?? n,
        secondName: info.secondName ?? "",
        lastName: info.lastName ?? s,
      });
      await purgeLegacyCarPrefsGlobalKeys();
      await purgeLegacyFlatlyBookingsGlobalKey();
      
      await clearCachedReferenceData();
      resetSearchLookupsMemo();

      router.replace("/(tabs)/search");
    } catch (err) {
        if (err instanceof ApiError) {
          const body = err.body as any;
          const code: string | undefined =
            body && typeof body === "object" ? String(body.code ?? body.message ?? "") : undefined;

          if (err.status === 409 || code === "USER_ALREADY_EXISTS" || code === "EMAIL_ALREADY_IN_USE") {
              Alert.alert("Account exists", "An account with this email already exists. Try logging in.");
              return;
          }

          if (err.status === 422) {
            Alert.alert("Invalid input", "Please check the form fields and try again.");
            return;
          }
        }

        // fallback
        const msg = prettyApiError(err);
        Alert.alert("Register failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 8 chars)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Surname"
            value={surname}
            onChangeText={setSurname}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone (optional) e.g. 123-456-789"
            value={phoneDisplay}
            keyboardType="number-pad"
            editable={!loading}
            onChangeText={(typed) => setPhoneDigits(onlyDigits(typed).slice(0, 9))}
          />

          <TouchableOpacity style={styles.button} onPress={onCreateAccount} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => router.replace("/") } disabled={loading}>
            <Text style={styles.linkText}>Back to login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#FACC15",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { fontWeight: "600", fontSize: 16 },
  linkBtn: { marginTop: 14, alignItems: "center" },
  linkText: { fontWeight: "700", color: "#2563EB" },
});
