// app/tabs/LikedCarsTab.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import type { LikedCar } from "../../lib/storage";
import { clearLikedCars, getLikedCars, removeLikedCar } from "../../lib/storage";

export default function LikedCarsTab() {
  const [liked, setLiked] = useState<LikedCar[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Booking modal state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingCar, setBookingCar] = useState<LikedCar | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

    function todayISO(): string {
    // local date, YYYY-MM-DD
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
    }

    function addDaysISO(iso: string, days: number): string {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
    dt.setDate(dt.getDate() + days);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
    }

    const minFrom = useMemo(() => todayISO(), []);
    const minTo = useMemo(() => (dateFrom ? addDaysISO(dateFrom, 1) : addDaysISO(minFrom, 1)), [dateFrom, minFrom]);

  const load = useCallback(async () => {
    const items = await getLikedCars();
    setLiked(items);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // ✅ This is the important fix: refresh when tab becomes active
  useFocusEffect(
    useCallback(() => {
      void load();
      return () => {};
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  async function onRemove(id: string) {
    await removeLikedCar(id);
    await load();
  }

  async function onClearAll() {
    await clearLikedCars();
    await load();
  }

  function openBooking(car: LikedCar) {
    setBookingCar(car);
    setDateFrom("");
    setDateTo("");
    setBookingOpen(true);
  }

  function closeBooking() {
    setBookingOpen(false);
    setBookingCar(null);
  }

  function confirmBooking() {
    if (!bookingCar) return;

    if (!dateFrom || dateFrom < minFrom) {
      Alert.alert("Invalid Date From", "Date From must be today or later.");
      return;
    }
    if (!dateTo || dateTo < minTo) {
      Alert.alert("Invalid Date To", "Date To must be after Date From.");
      return;
    }


    // For now: no backend call. Just show the payload so we can wire it later.
    Alert.alert(
      "Booking (not implemented)",
      `Car: ${bookingCar.title}\nFrom: ${dateFrom}\nTo: ${dateTo}`
    );
    closeBooking();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Liked</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{liked.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {liked.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No liked cars yet.</Text>
            <Text style={styles.emptySub}>Go to Search and tap ❤️ Like.</Text>
          </View>
        ) : (
          <>
            <Pressable style={styles.clearBtn} onPress={onClearAll}>
              <Text style={styles.clearBtnText}>Clear all</Text>
            </Pressable>

            {liked.map((car) => (
              <View key={car.id} style={styles.card}>
                <Image
                  source={{ uri: car.imageUrl || "https://picsum.photos/900/600" }}
                  style={styles.image}
                />

                <View style={styles.body}>
                  <Text style={styles.carTitle}>{car.title}</Text>
                  {car.subtitle ? <Text style={styles.subtitle}>{car.subtitle}</Text> : null}

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>⛽ {car.fuelType}</Text>
                    <Text style={styles.metaText}>🎨 {car.color}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.price}>
                      {car.pricePerDay} {car.currency} / day
                    </Text>

                    <View style={styles.actionsInline}>
                      <Pressable style={styles.bookBtn} onPress={() => openBooking(car)}>
                        <Text style={styles.bookBtnText}>Book</Text>
                      </Pressable>

                      <Pressable style={styles.removeBtn} onPress={() => onRemove(car.id)}>
                        <Text style={styles.removeBtnText}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Booking modal */}
      <Modal visible={bookingOpen} transparent={false} animationType="slide" onRequestClose={closeBooking}>
        <SafeAreaView style={styles.bookSafe} edges={["top", "bottom"]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.bookHeader}>
              <Text style={styles.bookTitle}>Book car</Text>
              <Pressable onPress={closeBooking}>
                <Text style={styles.bookClose}>Close</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.bookContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.bookCarTitle}>{bookingCar?.title ?? ""}</Text>

              <Text style={styles.fieldLabel}>Date From</Text>
              <View style={styles.calendarWrap}>
              <Calendar
                minDate={minFrom}
                onDayPress={(day) => {
                  const picked = day.dateString; // YYYY-MM-DD
                  setDateFrom(picked);

                  // enforce dateTo > dateFrom (if existing dateTo is invalid, clear it)
                  if (dateTo && dateTo <= addDaysISO(picked, 0)) {
                    setDateTo("");
                  }
                }}
                markedDates={{
                  ...(dateFrom
                    ? {
                        [dateFrom]: { selected: true, selectedColor: "#111827" },
                      }
                    : {}),
                }}
              />
            </View>

              <Text style={styles.fieldLabel}>Date To</Text>
              <View style={styles.calendarWrap}>
              <Calendar
                minDate={minTo}
                onDayPress={(day) => {
                  const picked = day.dateString; // YYYY-MM-DD

                  // guard: must be strictly greater than dateFrom and future
                  if (dateFrom && picked <= dateFrom) return;

                  setDateTo(picked);
                }}
                markedDates={{
                  ...(dateTo
                    ? {
                        [dateTo]: { selected: true, selectedColor: "#111827" },
                      }
                    : {}),
                }}
              />
                </View>

              <View style={styles.bookActions}>
                <Pressable style={[styles.modalBtn, styles.modalBtnGhost]} onPress={closeBooking}>
                  <Text style={[styles.modalBtnText, styles.modalBtnTextGhost]}>Cancel</Text>
                </Pressable>

                <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={confirmBooking}>
                  <Text style={styles.modalBtnText}>Continue</Text>
                </Pressable>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },

  countPill: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: { color: "#fff", fontWeight: "900" },

  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },

  empty: { marginTop: 80, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  emptySub: { color: "#6B7280", fontWeight: "600", textAlign: "center" },

  clearBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearBtnText: { fontWeight: "900", color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  image: { width: "100%", height: 180, backgroundColor: "#E5E7EB" },
  body: { padding: 14 },

  carTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6B7280", fontWeight: "600" },

  metaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  metaText: { color: "#111827", fontWeight: "800" },

  bottomRow: { marginTop: 12 },
  price: { fontSize: 16, fontWeight: "900", color: "#111827" },

  actionsInline: { marginTop: 10, flexDirection: "row", gap: 10 },

  bookBtn: {
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookBtnText: { fontWeight: "900", color: "#111827" },

  removeBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  removeBtnText: { fontWeight: "900", color: "#991B1B" },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "82%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  modalClose: { fontWeight: "800", color: "#111827" },

  modalCarTitle: { marginTop: 8, fontWeight: "900", color: "#111827", fontSize: 16 },

  fieldLabel: { marginTop: 14, marginBottom: 6, color: "#374151", fontWeight: "800" },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  modalActions: { marginTop: 18, flexDirection: "row", gap: 10 },
  modalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  modalBtnPrimary: { backgroundColor: "#111827" },
  modalBtnGhost: { backgroundColor: "#F3F4F6" },
  modalBtnText: { fontWeight: "900", color: "#fff" },
  modalBtnTextGhost: { color: "#111827" },

  bookSafe: { flex: 1, backgroundColor: "#F9FAFB" },

  bookHeader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  bookClose: { fontWeight: "900", color: "#111827" },

  bookContent: { paddingHorizontal: 16, paddingBottom: 16 },

  bookCarTitle: { marginTop: 8, fontWeight: "900", color: "#111827", fontSize: 20 },

  bookActions: { marginTop: 18, flexDirection: "row", gap: 10 },

  calendarWrap: { marginTop: 8, borderRadius: 14, overflow: "hidden", backgroundColor: "#fff" },


});
