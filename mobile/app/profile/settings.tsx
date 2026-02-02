//mobile/app/profile/settings.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getProfile, saveProfile, clearProfile, type Profile } from "../../lib/storage/profileStorage";
import { updateUserById, deleteUserById } from "../../lib/api/userApi";
import { getBookingsFromBackend } from "../../lib/api/bookingsApi";
import { getFlatlyBookings } from "../../lib/storage/flatlyBookingsStorage";
import { ApiError } from "../../lib/api/apiClient";

type PersonalDraft = {
  email: string;
  phoneDigits: string;
  firstName: string;
  secondName: string;
  lastName: string;
};

export default function ProfileSettings() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    userId: undefined,
    email: "",
    phoneDigits: "",
    firstName: "",
    secondName: "",
    lastName: "",
  });

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalDraft, setPersonalDraft] = useState<PersonalDraft>({
    email: "",
    phoneDigits: "",
    firstName: "",
    secondName: "",
    lastName: "",
  });

  const [editingPassword, setEditingPassword] = useState(false);
  const [pwdDraft, setPwdDraft] = useState({ newPassword: "", repeatPassword: "" });

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);
      setPersonalDraft({
        email: p.email ?? "",
        phoneDigits: p.phoneDigits ?? "",
        firstName: p.firstName ?? "",
        secondName: p.secondName ?? "",
        lastName: p.lastName ?? "",
      });
    })();
  }, []);

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

  /* ------------------ Personal ------------------ */

  function discardPersonal() {
    setPersonalDraft({
      email: profile.email ?? "",
      phoneDigits: profile.phoneDigits ?? "",
      firstName: profile.firstName ?? "",
      secondName: profile.secondName ?? "",
      lastName: profile.lastName ?? "",
    });
    setEditingPersonal(false);
  }

  async function savePersonal() {
    const email = personalDraft.email.trim();
    const phoneDigits = personalDraft.phoneDigits.trim();
    const firstName = personalDraft.firstName.trim();
    const secondName = personalDraft.secondName.trim();
    const lastName = personalDraft.lastName.trim();

    if (!email) {
      Alert.alert("Missing email", "Please enter your email.");
      return;
    }
    if (!firstName || !lastName) {
      Alert.alert("Missing name", "Please enter your name and surname.");
      return;
    }
    if (phoneDigits && !/^\d+$/.test(phoneDigits)) {
      Alert.alert("Invalid phone", "Phone number must contain digits only.");
      return;
    }

    try {
      if (profile.userId) {
        await updateUserById(profile.userId, {
          email,
          contactNumber: phoneDigits ? Number(phoneDigits) : undefined,
          firstName,
          secondName: secondName || undefined,
          lastName,
        });
      }

      const next: Profile = {
        ...profile,
        email,
        phoneDigits,
        firstName,
        secondName: secondName || "",
        lastName,
      };

      await saveProfile(next);
      setProfile(next);
      setEditingPersonal(false);

      Alert.alert("Saved", "Your personal data has been updated.");
    } catch (err) {
        if (err instanceof ApiError) {
            const body = err.body as any;
            const code =
              body && typeof body === "object"
                ? String(body.code ?? body.message ?? "")
                : "";

            // Email conflict - trying to change an email to an existing one
            if (err.status === 409 || code === "EMAIL_ALREADY_IN_USE" || code === "USER_ALREADY_EXISTS") {
              Alert.alert(
                "Email already in use",
                "This email address is already linked to another account. Please use a different one."
              );
              return;
            }

            // Validation errors
            if (err.status === 422) {
              Alert.alert(
                "Invalid data",
                "Some of the entered information is invalid. Please check the fields and try again."
              );
              return;
            }

            // Auth / permission issues
            if (err.status === 401 || err.status === 403) {
              Alert.alert(
                "Not allowed",
                "You are not allowed to perform this action. Please log in again."
              );
              return;
            }

            // Known HTTP error, unknown case
            Alert.alert(
              "Update failed",
              "We couldn’t update your profile right now. Please try again later."
            );
            return;
          }

          // Non-API / unexpected error
          Alert.alert(
            "Unexpected error",
            "Something went wrong. Please try again."
          );
    }
  }

  /* ------------------ Password ------------------ */

  function discardPassword() {
    setPwdDraft({ newPassword: "", repeatPassword: "" });
    setEditingPassword(false);
  }

  async function savePassword() {
    if (!profile.userId) {
      Alert.alert("Not available", "Please log in again to change your password.");
      return;
    }

    const { newPassword, repeatPassword } = pwdDraft;

    if (!newPassword || newPassword.length < 8) {
      Alert.alert("Invalid password", "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== repeatPassword) {
      Alert.alert("Passwords don't match", "Please repeat the same password.");
      return;
    }

    try {
      await updateUserById(profile.userId, { password: newPassword });
      discardPassword();
      Alert.alert("Saved", "Your password has been changed.");
    } catch (e: any) {
      Alert.alert("Password change failed", e?.message ?? "Server update failed");
    }
  }

  /* ------------------ Logout / Delete ------------------ */

  async function onLogout() {
    Alert.alert("Log out?", "You will need to log in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await clearProfile();
          router.replace("/");
        },
      },
    ]);
  }
    async function checkHasActiveBookings(): Promise<
      | { ok: true; hasActive: boolean }
      | { ok: false; message: string }
    > {
      // 1) Carly (car) bookings - live from backend
      try {
        const carBookings = await getBookingsFromBackend();
        const hasActiveCar = carBookings.some((b) => b.status === "current" && b.state === "Booked");
        if (hasActiveCar) return { ok: true, hasActive: true };
      } catch {
        return {
          ok: false,
          message:
            "Can’t delete your account right now because we couldn’t verify your Carly bookings (backend might be down). Please try again later.",
        };
      }

      // 2) Flatly bookings - local storage snapshot
      try {
        const flatly = await getFlatlyBookings();
        const hasActiveFlat = flatly.some((b) => b.status === "CREATED");
        return { ok: true, hasActive: hasActiveFlat };
      } catch {
        return {
          ok: false,
          message:
            "Can’t delete your account right now because we couldn’t verify your Flatly bookings. Please try again later.",
        };
      }
    }
  async function onDeleteAccount() {
    if (!profile.userId) {
      Alert.alert("Not available", "Please log in again.");
      return;
    }

    //  Validation: block deletion if there are active bookings
    const check = await checkHasActiveBookings();
    if (!check.ok) {
      Alert.alert("Delete account blocked", check.message);
      return;
    }
    if (check.hasActive) {
      Alert.alert(
        "Delete account blocked",
        "You have active bookings. Cancel them first, then you can delete your account."
      );
      return;
    }

    Alert.alert(
      "Delete account?",
      "This action is irreversible. All your data will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserById(profile.userId);
            } catch {
              // even if backend fails, wipe local state
            }
            await clearProfile();
            router.replace("/");
          },
        },
      ]
    );
  }

  /* ------------------ UI ------------------ */

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.h1}>Profile settings</Text>

          {/* -------- Personal -------- */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Personal</Text>

            <Text style={styles.label}>email:</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={personalDraft.email}
              editable={editingPersonal}
              onChangeText={(v) => setPersonalDraft((p) => ({ ...p, email: v }))}
            />

            <Text style={styles.label}>phone number:</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={personalDraft.phoneDigits}
              editable={editingPersonal}
              keyboardType="number-pad"
              onChangeText={(v) => setPersonalDraft((p) => ({ ...p, phoneDigits: v }))}
            />

            <Text style={styles.label}>name:</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={personalDraft.firstName}
              editable={editingPersonal}
              onChangeText={(v) => setPersonalDraft((p) => ({ ...p, firstName: v }))}
            />

            <Text style={styles.label}>second name (optional):</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={personalDraft.secondName}
              editable={editingPersonal}
              onChangeText={(v) => setPersonalDraft((p) => ({ ...p, secondName: v }))}
            />

            <Text style={styles.label}>surname:</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={personalDraft.lastName}
              editable={editingPersonal}
              onChangeText={(v) => setPersonalDraft((p) => ({ ...p, lastName: v }))}
            />

            <View style={styles.btnRow}>
              {!editingPersonal ? (
                <Pressable style={styles.btn} onPress={() => setEditingPersonal(true)}>
                  <Text style={styles.btnText}>Edit</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable style={styles.btn} onPress={savePersonal}>
                    <Text style={styles.btnText}>Save</Text>
                  </Pressable>
                  <Pressable style={styles.btnAlt} onPress={discardPersonal}>
                    <Text style={styles.btnText}>Discard</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* -------- Security -------- */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Security</Text>

            <Text style={styles.label}>new password:</Text>
            <TextInput
              style={[styles.input, !editingPassword && styles.inputReadOnly]}
              value={pwdDraft.newPassword}
              editable={editingPassword}
              secureTextEntry
              onChangeText={(v) => setPwdDraft((p) => ({ ...p, newPassword: v }))}
            />

            <Text style={styles.label}>repeat new password:</Text>
            <TextInput
              style={[styles.input, !editingPassword && styles.inputReadOnly]}
              value={pwdDraft.repeatPassword}
              editable={editingPassword}
              secureTextEntry
              onChangeText={(v) => setPwdDraft((p) => ({ ...p, repeatPassword: v }))}
            />

            <View style={styles.btnRow}>
              {!editingPassword ? (
                <Pressable style={styles.btn} onPress={() => setEditingPassword(true)}>
                  <Text style={styles.btnText}>Change</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable style={styles.btn} onPress={savePassword}>
                    <Text style={styles.btnText}>Save</Text>
                  </Pressable>
                  <Pressable style={styles.btnAlt} onPress={discardPassword}>
                    <Text style={styles.btnText}>Discard</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* -------- Danger zone -------- */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account</Text>

            <Pressable style={styles.btnAlt} onPress={onLogout}>
              <Text style={styles.btnText}>Log out</Text>
            </Pressable>

            <Pressable style={styles.btnDanger} onPress={onDeleteAccount}>
              <Text style={styles.btnText}>Delete account</Text>
            </Pressable>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },
  page: { padding: 16, gap: 14 },

  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  backText: { fontWeight: "900", color: "#111827" },

  h1: { fontSize: 22, fontWeight: "900", color: "#111827" },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },

  label: { fontWeight: "900", color: "#111827", marginTop: 6 },

  input: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontWeight: "800",
    color: "#111827",
  },
  inputReadOnly: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    color: "#374151",
  },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: "#FDE68A",
  },
  btnAlt: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: "#FFF7ED",
  },
  btnDanger: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEE2E2",
  },

  btnText: { fontWeight: "900", color: "#111827" },
});
