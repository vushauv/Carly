//mobile/app/index.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError } from "../lib/api/apiClient";
import { resetSearchLookupsMemo } from "../lib/api/carlyApi";
import { loginUser, getUserById } from "../lib/api/userApi";

import { saveProfile } from "../lib/storage/profileStorage";
import { purgeLegacyCarPrefsGlobalKeys } from "../lib/storage/storage";
import { clearCachedReferenceData } from "../lib/storage/referenceDataStorage";
import { purgeLegacyFlatlyBookingsGlobalKey } from "../lib/storage/flatlyBookingsStorage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function onLogin() {
    const e = email.trim();
    const p = password;

    if (!e || !p) {
      Alert.alert("Missing fields", "Email and password are required.");
      return;
    }

    setLoading(true);
    try {
        //console.log("API_BASE_URL =", require("../lib/apiClient").API_BASE_URL);

      // POST /users/login -> { userId } :contentReference[oaicite:6]{index=6}
      const { userId } = await loginUser({ email: e, password: p });

      // GET /users/{id} -> user info
      const info = await getUserById(userId);

      await saveProfile({
        userId,
        email: info.email ?? e,
        phoneDigits: info.contactNumber ? String(info.contactNumber) : "",
        firstName: info.firstName ?? "",
        secondName: info.secondName ?? "",
        lastName: info.lastName ?? "",
      });

      await purgeLegacyCarPrefsGlobalKeys();
      await purgeLegacyFlatlyBookingsGlobalKey();

      await clearCachedReferenceData();
      resetSearchLookupsMemo();
      router.replace("/(tabs)/search");
     } catch (err: any) {
      if (err instanceof ApiError) {
        // If backend returns ExceptionDetails, it's likely in err.body
        const body = err.body as any;

        // Support BOTH shapes:
        // 1) { code: "EMAIL_NOT_FOUND", message: "..." }
        // 2) { message: "EMAIL_NOT_FOUND", ... }
        const code: string | undefined =
          (body && typeof body === "object" && (body.code || body.message)) || undefined;

        if (err.status === 422) {
          Alert.alert("Invalid input", "Please enter a valid email and password.");
          return;
        }

        if (err.status === 401) {
          if (code === "EMAIL_NOT_FOUND") {
            Alert.alert("Login failed", "No account exists for this email.");
            return;
          }
          if (code === "INVALID_PASSWORD") {
            Alert.alert("Login failed", "Wrong password.");
            return;
          }

          // fallback if backend doesn't send code
          Alert.alert("Login failed", "Invalid email or password.");
          return;
        }

        // Other HTTP errors
        Alert.alert("Error", err.message);
        return;
      }

      Alert.alert("Login failed", err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.page}>
          <Image
            source={require("../assets/images/carly-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
              {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Log in</Text>}
            </TouchableOpacity>

            <Text style={styles.footerText}>Not registered yet?</Text>
            <TouchableOpacity onPress={() => router.push("/register")} disabled={loading}>
              <Text style={styles.signUp}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFBEB",
  },
  page: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 220,
    height: 90,
    alignSelf: "center",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#111827",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    color: "#111827",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#FACC15",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  buttonText: {
    fontWeight: "900",
    fontSize: 16,
    color: "#111827",
  },
  footerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "700",
  },
  signUp: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "900",
    marginTop: 4,
  },
});
