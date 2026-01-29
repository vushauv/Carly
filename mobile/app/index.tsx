import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions
} from "react-native";
import { useRouter } from "expo-router";


const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);




export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);

  const {width} = useWindowDimensions();
  const logoWidth = width * 0.5;



  const onLoginPress = () => {
    setIsEmailValid(isValidEmail(email));
    // no logic yet, we need to validate that in the future
    if (isValidEmail(email))
      router.replace("/tabs/SearchTab");
  };



  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image
        source={require("../assets/images/carly-logo.png")}
        style={[styles.logo, {width: logoWidth, height: logoWidth * 0.4}]}
        resizeMode="contain"
      />
      <View style={styles.card}>
        

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          autoCapitalize="none"
          secureTextEntry
          style={styles.input}
        />
        <Pressable style={styles.button} onPress={onLoginPress}>
          <Text style={styles.buttonText}>Log in</Text>
        </Pressable>
        <Text style={styles.hintText}>
          Not registered yet?
        </Text>
        <Pressable onPress={() => router.push("/RegisterScreen")}>
          <Text style={styles.linkText}>
            Sign Up
          </Text>
        </Pressable>

        {!isEmailValid && email.length > 0 && (
          <Text style={styles.errorText}>
            Please enter a valid email address
          </Text>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F3F4F6",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  button: {
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2C94C",
    marginTop: 4,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },
  hintText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F2C94C",
    textAlign: "center",
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: -6,
    textAlign: "center",

  },
  logo: {
  width: 140,
  height: 60,
  alignSelf: "center",
  marginBottom: 16,
},


});
