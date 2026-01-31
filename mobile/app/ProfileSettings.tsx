// app/ProfileSettings.tsx
import React, { useEffect, useMemo, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile, saveProfile, type Profile } from "../lib/profileStorage";
import { updateUserById, deleteUserById } from "../lib/userApi";

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

function splitFullName(fullName: string): { firstName: string; secondName?: string; lastName: string } {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };

  return {
    firstName: parts[0],
    secondName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export default function ProfileSettings() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile>({
    userId: undefined,
    email: "",
    phoneDigits: "",
    fullName: "",
  });

  const [editingPersonal, setEditingPersonal] = useState(false);

  const [personalDraft, setPersonalDraft] = useState({
    email: "",
    phoneDigits: "",
    fullName: "",
  });

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);

      setPersonalDraft({
        email: p.email,
        phoneDigits: p.phoneDigits,
        fullName: p.fullName,
      });

      setLoading(false);
    })();
  }, []);

  const hasUnsaved = useMemo(() => editingPersonal, [editingPersonal]);

  function discardPersonal() {
    setPersonalDraft({
      email: profile.email,
      phoneDigits: profile.phoneDigits,
      fullName: profile.fullName,
    });
    setEditingPersonal(false);
  }

  async function savePersonal() {
    const email = personalDraft.email.trim();
    const phoneDigits = onlyDigits(personalDraft.phoneDigits).slice(0, 9);
    const fullName = personalDraft.fullName.trim();

    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    if (!fullName) {
      Alert.alert("Missing name", "Please enter your name and surname.");
      return;
    }

    if (phoneDigits.length > 0 && phoneDigits.length < 9) {
      Alert.alert("Invalid phone", "Phone number must have 9 digits.");
      return;
    }

    // If we have a server userId, sync it
    if (profile.userId) {
      const { firstName, secondName, lastName } = splitFullName(fullName);

      try {
        await updateUserById(profile.userId, {
          firstName,
          secondName,
          lastName,
          email,
          contactNumber: phoneDigits ? Number(phoneDigits) : undefined,
        });
      } catch (e: any) {
        Alert.alert("Save failed", e?.message ?? "Server update failed");
        return; // don't apply local changes if server rejected
      }
    }

    const next: Profile = { ...profile, email, phoneDigits, fullName };
    await saveProfile(next);

    setProfile(next);
    setPersonalDraft({
      email: next.email,
      phoneDigits: next.phoneDigits,
      fullName: next.fullName,
    });

    setEditingPersonal(false);
  }

  function confirmLogout() {
    Alert.alert("Log out?", "Are you sure you want to log out?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          router.replace("/");
        },
      },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert("Delete the account?", "Are you sure you want to delete the account?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          // Best-effort server delete if we have a userId
          if (profile.userId) {
            try {
              await deleteUserById(profile.userId);
            } catch {
              // don't block local delete
            }
          }

          await AsyncStorage.clear();
          router.replace("/");
        },
      },
    ]);
  }

  function handleBack() {
    if (!hasUnsaved) {
      router.back();
      return;
    }

    Alert.alert("Discard changes?", "You have unsaved changes. Discard and go back?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          discardPersonal();
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <Text style={styles.muted}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const phoneDisplay = formatPhone(personalDraft.phoneDigits);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← back</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Profile settings</Text>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Personal:</Text>

            <Text style={styles.label}>email:</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={personalDraft.email}
              onChangeText={(v) => setPersonalDraft((p) => ({ ...p, email: v }))}
              editable={editingPersonal}
              placeholder="name@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>phone:</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={phoneDisplay}
              editable={editingPersonal}
              placeholder="123-456-789"
              keyboardType="number-pad"
              onChangeText={(typed) => {
                const digits = onlyDigits(typed).slice(0, 9);
                setPersonalDraft((p) => ({ ...p, phoneDigits: digits }));
              }}
            />
            {editingPersonal ? <Text style={styles.helper}>XXX-XXX-XXX</Text> : null}

            <Text style={styles.label}>name and surname:</Text>
            <TextInput
              style={[styles.input, !editingPersonal && styles.inputReadOnly]}
              value={personalDraft.fullName}
              onChangeText={(v) => setPersonalDraft((p) => ({ ...p, fullName: v }))}
              editable={editingPersonal}
              placeholder="Rafal Trzaskowski"
            />

            <View style={styles.btnRow}>
              {!editingPersonal ? (
                <Pressable
                  style={[styles.btn, styles.btnEdit]}
                  onPress={() => {
                    setEditingPersonal(true);
                    setPersonalDraft({
                      email: profile.email,
                      phoneDigits: profile.phoneDigits,
                      fullName: profile.fullName,
                    });
                  }}
                >
                  <Text style={styles.btnTextDark}>Edit</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable style={[styles.btn, styles.btnSave]} onPress={savePersonal}>
                    <Text style={styles.btnTextDark}>Save</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.btnDiscard]} onPress={discardPersonal}>
                    <Text style={styles.btnTextDark}>Discard</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          <View style={styles.bottomActions}>
            <Pressable style={[styles.bigBtn, styles.bigBtnLogout]} onPress={confirmLogout}>
              <Text style={styles.bigBtnTextDark}>Log out</Text>
            </Pressable>

            <Pressable style={[styles.bigBtn, styles.bigBtnDelete]} onPress={confirmDeleteAccount}>
              <Text style={styles.bigBtnTextDark}>Delete the account</Text>
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

  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  backText: { fontWeight: "900", color: "#111827" },

  page: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  pageTitle: { fontSize: 22, fontWeight: "900", color: "#111827", marginTop: 4 },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827", marginBottom: 2 },

  label: { color: "#111827", fontWeight: "900", marginTop: 6 },
  input: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "700",
    color: "#111827",
  },
  inputReadOnly: { opacity: 0.85 },

  helper: { marginTop: 6, color: "#6B7280", fontWeight: "700" },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 92,
    borderWidth: 1,
  },

  btnEdit: { backgroundColor: "#DBEAFE", borderColor: "#93C5FD" },
  btnSave: { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" },
  btnDiscard: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
  btnTextDark: { fontWeight: "900", color: "#111827" },

  bottomActions: { gap: 10, marginTop: 4, alignItems: "center" },
  bigBtn: {
    width: "70%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  bigBtnLogout: { backgroundColor: "#DBEAFE", borderColor: "#93C5FD" },
  bigBtnDelete: { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" },
  bigBtnTextDark: { fontWeight: "900", color: "#111827" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#6B7280", fontWeight: "800" },
});
