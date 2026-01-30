import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.replace("/tabs/SearchTab");
              }}
            >
              <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>Not registered yet?</Text>
            <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
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

