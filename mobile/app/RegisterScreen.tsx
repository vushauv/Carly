// app/RegisterScreen.tsx
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { saveProfile, type Profile } from "../lib/profileStorage";

function onlyDigits(s: string): string {
  return (s || "").replace(/\D/g, "");
}

function formatPhone(digits: string): string {
  // Format as 123-456-789 while typing (same pattern as ProfileSettings)
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

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // still present, not used elsewhere (keeping behavior)
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  const phoneDisplay = useMemo(() => formatPhone(phoneDigits), [phoneDigits]);

  async function onCreateAccount() {
    const e = email.trim();
    const n = name.trim();
    const s = surname.trim();
    const p = onlyDigits(phoneDigits).slice(0, 9);

    if (!isValidEmail(e)) {
      Alert.alert("Invalid email", "Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!n || !s) {
      Alert.alert("Missing info", "Please enter your name and surname.");
      return;
    }

    // optional phone, but if provided must be 9 digits (same rule as ProfileSettings)
    if (p.length > 0 && p.length < 9) {
      Alert.alert("Invalid phone", "Phone number must have 9 digits.");
      return;
    }

    const profile: Profile = {
      email: e,
      phoneDigits: p,
      fullName: `${n} ${s}`.trim(),
    };

    await saveProfile(profile);

    // existing behavior: go to Search after registering
    router.replace("/tabs/SearchTab");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Surname"
            value={surname}
            onChangeText={setSurname}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone (optional) e.g. 123-456-789"
            value={phoneDisplay}
            keyboardType="number-pad"
            onChangeText={(typed) => {
              const digits = onlyDigits(typed).slice(0, 9);
              setPhoneDigits(digits);
            }}
          />

          <TouchableOpacity style={styles.button} onPress={onCreateAccount}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
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
  buttonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
