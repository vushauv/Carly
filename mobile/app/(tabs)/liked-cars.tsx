// mobile/app/(tabs)/liked-cars.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Dimensions,
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

import { useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import CarCardView from "../components/CarCardView";

import { ApiError } from "../../lib/api/apiClient";
import { createCarBookingOnBackend } from "../../lib/api/bookingsApi";

import {
  createFlatlyBooking,
  getAvailableFlats,
  type FlatlyFlatDto,
} from "../../lib/api/flatlyApi";

import type { LikedCar } from "../../lib/storage/storage";
import { clearLikedCars, getLikedCars, removeLikedCar } from "../../lib/storage/storage";

import { upsertFlatlyBooking } from "../../lib/storage/flatlyBookingsStorage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FlowStep =
  | "none"
  | "bookCar"
  | "carSuccess"
  | "browseFlats"
  | "flatGuests"
  | "flatSuccess";

function todayISO(): string {
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

function toLocalDateTimeString(dayISO: string, hhmmss = "12:00:00"): string {
  // Backend expects LocalDateTime, so no timezone suffix.
  return `${dayISO}T${hhmmss}`;
}

function friendlyBookingError(err: unknown): { title: string; message: string } {
  if (err instanceof ApiError) {
    const body = err.body as any;
    const code =
      body && typeof body === "object"
        ? String(body.code ?? body.message ?? "")
        : "";

    if (err.status === 409 || code.includes("CONFLICT") || code.includes("OVERLAP")) {
      return {
        title: "Booking unavailable",
        message:
          "Those dates aren’t available anymore (someone else likely booked it). Please pick different dates and try again.",
      };
    }

    if (err.status === 422) {
      return {
        title: "Invalid booking data",
        message: "Please check the dates / guest count and try again.",
      };
    }

    if (err.status === 401 || err.status === 403) {
      return {
        title: "Not allowed",
        message: "Please log in again and retry.",
      };
    }

    return {
      title: "Booking failed",
      message: "We couldn’t complete the booking right now. Please try again later.",
    };
  }

  return { title: "Booking failed", message: "Something went wrong. Please try again." };
}

export default function LikedCarsTab() {
  const [liked, setLiked] = useState<LikedCar[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const router = useRouter();

  // Flow state
  const [step, setStep] = useState<FlowStep>("none");
  const [car, setCar] = useState<LikedCar | null>(null);
  const [guestsCount, setGuestsCount] = useState<string>("1");
  const [flatBookingSubmitting, setFlatBookingSubmitting] = useState(false);

  // car booking dates
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // partner flats
  const [flatsLoading, setFlatsLoading] = useState(false);
  const [flats, setFlats] = useState<FlatlyFlatDto[]>([]);
  const [flatIndex, setFlatIndex] = useState(0);
  const [flatImgIndex, setFlatImgIndex] = useState<Record<string, number>>({}); // per flat id

  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    const items = await getLikedCars();
    setLiked(items);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  function confirmClearAll() {
    Alert.alert("Clear all?", "Are you sure you want to clear all liked cars?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: () => void onClearAll() },
    ]);
  }

  const minFrom = useMemo(() => todayISO(), []);
  const minTo = useMemo(
    () => (dateFrom ? addDaysISO(dateFrom, 1) : addDaysISO(minFrom, 1)),
    [dateFrom, minFrom]
  );

  function openCarBooking(c: LikedCar) {
    setCar(c);
    setDateFrom("");
    setDateTo("");
    setStep("bookCar");
  }

  function closeFlow() {
    setStep("none");
    setCar(null);
    setDateFrom("");
    setDateTo("");
    setFlats([]);
    setFlatIndex(0);
    setFlatImgIndex({});
    setBookingId("");
    setGuestsCount("1");
    setFlatBookingSubmitting(false);
  }

  function goToCurrentBookings() {
    closeFlow();
    router.replace({
      pathname: "/(tabs)/home",
      params: { section: "current" },
    });
  }

  async function confirmCarBooking() {
    if (!car) return;

    if (!dateFrom || dateFrom < minFrom) {
      Alert.alert("Invalid Date From", "Date From must be today or later.");
      return;
    }
    if (!dateTo || dateTo < minTo) {
      Alert.alert("Invalid Date To", "Date To must be after Date From.");
      return;
    }

    try {
      const fromLocal = toLocalDateTimeString(dateFrom, "12:00:00");
      const toLocal = toLocalDateTimeString(dateTo, "12:00:00");

      const newBookingId = await createCarBookingOnBackend({
        carId: Number(car.id),
        dateFromISO: fromLocal,
        dateToISO: toLocal,
      });

      setBookingId(newBookingId);
      setStep("carSuccess");
    } catch (err) {
      const ui = friendlyBookingError(err);
      Alert.alert(ui.title, ui.message);
    }
  }

  async function openBrowseFlats() {
    if (!dateFrom || !dateTo) {
      Alert.alert("Missing dates", "Book a car first (dates are required).");
      return;
    }
    setStep("browseFlats");
    setFlatsLoading(true);
    try {
      const res = await getAvailableFlats(dateFrom, dateTo);
      setFlats(res);
      setFlatIndex(0);
      setFlatImgIndex({});
    } catch (e: any) {
      Alert.alert("Failed to load flats", e?.message ?? "Unknown error");
      setFlats([]);
    } finally {
      setFlatsLoading(false);
    }
  }

  function onBookFlat() {
    const f = flats[flatIndex];
    if (!f) return;

    const maxGuests = typeof (f as any).maxGuests === "number" ? (f as any).maxGuests : undefined;
    const startDefault = "1";
    const clamped = maxGuests && Number(startDefault) > maxGuests ? String(maxGuests) : startDefault;

    setGuestsCount(clamped);
    setStep("flatGuests");
  }

  async function submitFlatBooking() {
    const f = flats[flatIndex];
    if (!f) return;

    const maxGuests = typeof (f as any).maxGuests === "number" ? (f as any).maxGuests : undefined;
    const n = Number(String(guestsCount ?? "").trim());

    if (!Number.isFinite(n) || n < 1) {
      Alert.alert("Invalid guest count", "Please enter a number >= 1.");
      return;
    }
    if (maxGuests && n > maxGuests) {
      Alert.alert("Too many guests", `This flat allows up to ${maxGuests} guests.`);
      return;
    }

    setFlatBookingSubmitting(true);
    try {
      const flatBookingId = await createFlatlyBooking({
        flatId: String((f as any).id),
        checkInDayISO: dateFrom,
        checkOutDayISO: dateTo,
        guestsCount: n,
      });

      // ✅ Store ACTIVE booking locally (per-user) so you have fallback if partner API is down.
      // This does NOT keep cancelled ones.
      const flatName = String((f as any).name ?? "Flat").trim() || "Flat";
      const city = String((f as any).city ?? "—").trim() || "—";
      const country = String((f as any).country ?? "—").trim() || "—";
      const rooms = typeof (f as any).rooms === "number" ? (f as any).rooms : undefined;
      const maxG = typeof (f as any).maxGuests === "number" ? (f as any).maxGuests : undefined;

      const urls =
        Array.isArray((f as any).images) && (f as any).images.length
          ? (f as any).images
              .map((x: any) => String(x?.image_url ?? "").trim())
              .filter(Boolean)
          : [];

      await upsertFlatlyBooking({
        flatBookingId: String(flatBookingId),
        dateFromDayISO: dateFrom,
        dateToDayISO: dateTo,
        flatSnapshot: {
          name: flatName,
          city,
          country,
          rooms,
          maxGuests: maxG,
          imageUrls: urls,
        },
      });

      setBookingId(flatBookingId);
      setStep("flatSuccess");
    } catch (err) {
      const ui = friendlyBookingError(err);
      Alert.alert(ui.title, ui.message);
      setStep("browseFlats");
    } finally {
      setFlatBookingSubmitting(false);
    }
  }

  const modalOpen = step !== "none";

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
            <Pressable style={styles.clearBtn} onPress={confirmClearAll}>
              <Text style={styles.clearBtnText}>Clear all</Text>
            </Pressable>

            {liked.map((c) => (
              <CarCardView
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                images={c.imageUrls?.length ? c.imageUrls : c.imageUrl ? [c.imageUrl] : []}
                fallbackSource={require("../../assets/images/no-images.png")}
                metaLeft={`⛽ ${c.fuelType}`}
                metaRight={`🎨 ${c.color}`}
                footerLeft={`${c.pricePerDay} ${c.currency} / day`}
                footerRight={
                  <View style={styles.actionsInline}>
                    <Pressable style={styles.bookBtn} onPress={() => openCarBooking(c)}>
                      <Text style={styles.bookBtnText}>Book</Text>
                    </Pressable>

                    <Pressable style={styles.removeBtn} onPress={() => void onRemove(c.id)}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </Pressable>
                  </View>
                }
                imageHeight={200}
              />
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent={false} animationType="slide" onRequestClose={closeFlow}>
        <SafeAreaView style={[styles.flowSafe, { paddingTop: insets.top, paddingBottom: insets.bottom }]} edges={[]}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={[styles.flowHeader, { paddingTop: 6 }]}>
              <Text style={styles.flowTitle}>
                {step === "bookCar" && "Book car"}
                {step === "carSuccess" && "Promo a partner"}
                {step === "browseFlats" && "Booking a flat"}
                {step === "flatGuests" && "Booking a flat"}
                {step === "flatSuccess" && "Promo a partner"}
              </Text>

              <Pressable onPress={closeFlow}>
                <Text style={styles.flowClose}>Close</Text>
              </Pressable>
            </View>

            {step === "bookCar" ? (
              <ScrollView contentContainerStyle={styles.flowContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.flowCarTitle}>{car?.title ?? ""}</Text>

                <Text style={styles.fieldLabel}>From</Text>
                <View style={styles.calendarWrap}>
                  <Calendar
                    minDate={minFrom}
                    onDayPress={(day) => {
                      const picked = day.dateString;
                      setDateFrom(picked);
                      if (dateTo && dateTo <= picked) setDateTo("");
                    }}
                    markedDates={dateFrom ? { [dateFrom]: { selected: true, selectedColor: "#111827" } } : {}}
                  />
                </View>

                <Text style={styles.fieldLabel}>To</Text>
                <View style={styles.calendarWrap}>
                  <Calendar
                    minDate={minTo}
                    onDayPress={(day) => {
                      const picked = day.dateString;
                      if (dateFrom && picked <= dateFrom) return;
                      setDateTo(picked);
                    }}
                    markedDates={dateTo ? { [dateTo]: { selected: true, selectedColor: "#111827" } } : {}}
                  />
                </View>

                <View style={styles.flowActions}>
                  <Pressable style={[styles.actionBtn, styles.actionGhost]} onPress={closeFlow}>
                    <Text style={[styles.actionText, styles.actionGhostText]}>Cancel</Text>
                  </Pressable>

                  <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={confirmCarBooking}>
                    <Text style={styles.actionText}>Book</Text>
                  </Pressable>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            ) : null}

            {step === "carSuccess" ? (
              <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <ScrollView contentContainerStyle={styles.flowContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.successText}>
                    You have made a successful booking of {car?.title ?? "car"} from {dateFrom} to {dateTo}
                  </Text>

                  <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={goToCurrentBookings}>
                    <Text style={styles.actionText}>See my bookings</Text>
                  </Pressable>

                  <View style={styles.partnerBox}>
                    <Text style={styles.partnerTitle}>
                      Would you like to rent a flat in these days from our partners? 🥳🙏
                    </Text>
                    <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={openBrowseFlats}>
                      <Text style={styles.actionText}>Browse flats</Text>
                    </Pressable>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>
              </SafeAreaView>
            ) : null}

            {step === "browseFlats" ? (
              <View style={{ flex: 1 }}>
                {flatsLoading ? (
                  <View style={styles.center}>
                    <ActivityIndicator />
                    <Text style={styles.muted}>Loading flats…</Text>
                  </View>
                ) : flats.length === 0 ? (
                  <View style={styles.center}>
                    <Text style={styles.muted}>No flats returned.</Text>
                    <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={openBrowseFlats}>
                      <Text style={styles.actionText}>Retry</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 90 }}
                      onScroll={(e) => {
                        const x = e.nativeEvent.contentOffset.x;
                        const w = e.nativeEvent.layoutMeasurement.width || 1;
                        setFlatIndex(Math.round(x / w));
                      }}
                      scrollEventThrottle={16}
                    >
                      {flats.map((f: any) => {
                        const flatId = String(f.id);
                        const name = String(f.name ?? "Flat").trim() || "Flat";
                        const city = String(f.city ?? "—").trim() || "—";
                        const country = String(f.country ?? "—").trim() || "—";
                        const rooms = typeof f.rooms === "number" ? f.rooms : undefined;
                        const maxGuests = typeof f.maxGuests === "number" ? f.maxGuests : undefined;

                        const urls =
                          Array.isArray(f.images) && f.images.length
                            ? f.images
                                .map((x: any) => String(x?.image_url ?? "").trim())
                                .filter(Boolean)
                            : [];

                        const hasImages = urls.length > 0;

                        return (
                          <View key={flatId} style={{ width: SCREEN_WIDTH, paddingHorizontal: 16 }}>
                            <View style={styles.flatCard}>
                              <View style={styles.flatCarouselWrap}>
                                <ScrollView
                                  horizontal
                                  pagingEnabled
                                  directionalLockEnabled
                                  showsHorizontalScrollIndicator={false}
                                  onScroll={(e) => {
                                    const x = e.nativeEvent.contentOffset.x;
                                    const w = e.nativeEvent.layoutMeasurement.width || 1;
                                    const idx = Math.round(x / w);
                                    setFlatImgIndex((prev) => ({ ...prev, [flatId]: idx }));
                                  }}
                                  scrollEventThrottle={16}
                                >
                                  {hasImages ? (
                                    urls.map((u: string) => (
                                      <Image
                                        key={u}
                                        source={{ uri: u }}
                                        style={styles.flatImage}
                                        resizeMode="cover"
                                      />
                                    ))
                                  ) : (
                                    <View style={styles.noImageWrap}>
                                      <Image
                                        source={require("../../assets/images/no-images.png")}
                                        style={styles.flatImage}
                                        resizeMode="cover"
                                      />
                                      <View style={styles.noImageOverlay}>
                                        <Text style={styles.noImageText}>No image available</Text>
                                      </View>
                                    </View>
                                  )}
                                </ScrollView>

                                <View style={styles.dotsRow}>
                                  {(hasImages ? urls : ["x"]).map((_, i) => (
                                    <View
                                      key={i}
                                      style={[
                                        styles.dot,
                                        (flatImgIndex[flatId] ?? 0) === i && styles.dotActive,
                                      ]}
                                    />
                                  ))}
                                </View>
                              </View>

                              <View style={styles.flatBody}>
                                <Text style={styles.flatTitle}>{name}</Text>

                                <Text style={styles.flatSub}>
                                  {city}, {country}
                                </Text>

                                <View style={styles.flatMetaRow}>
                                  <Text style={styles.flatMeta}>
                                    🛏️ Rooms: {typeof rooms === "number" ? rooms : "—"}
                                  </Text>
                                  <Text style={styles.flatMeta}>
                                    👤 Max: {typeof maxGuests === "number" ? maxGuests : "—"}
                                  </Text>
                                </View>

                                <Text style={styles.flatHint}>
                                  {dateFrom} → {dateTo}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>

                    <View style={styles.flowActionsFixed}>
                      <Pressable style={[styles.actionBtn, styles.actionGhost]} onPress={() => setStep("carSuccess")}>
                        <Text style={[styles.actionText, styles.actionGhostText]}>Back</Text>
                      </Pressable>
                      <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={onBookFlat}>
                        <Text style={styles.actionText}>Book</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            ) : null}

            {step === "flatGuests" ? (
              <View style={{ flex: 1, padding: 16, gap: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#111827" }}>Guest count</Text>

                <Text style={{ fontWeight: "800", color: "#6B7280" }}>
                  How many guests will stay in this flat?
                </Text>

                <TextInput
                  value={guestsCount}
                  onChangeText={setGuestsCount}
                  keyboardType="number-pad"
                  placeholder="1"
                  style={{
                    backgroundColor: "#FFFBEB",
                    borderWidth: 1,
                    borderColor: "#FDE68A",
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    fontWeight: "900",
                    color: "#111827",
                  }}
                />

                <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                  <Pressable
                    onPress={() => setStep("browseFlats")}
                    disabled={flatBookingSubmitting}
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      paddingVertical: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#FDE68A",
                      backgroundColor: "#FEF3C7",
                      opacity: flatBookingSubmitting ? 0.6 : 1,
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: "#111827" }}>Back</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => void submitFlatBooking()}
                    disabled={flatBookingSubmitting}
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      paddingVertical: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#F59E0B",
                      backgroundColor: "#FACC15",
                      opacity: flatBookingSubmitting ? 0.6 : 1,
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: "#111827" }}>
                      {flatBookingSubmitting ? "Booking…" : "Confirm booking"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {step === "flatSuccess" ? (
              <ScrollView contentContainerStyle={styles.flowContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.successText}>
                  You have made a successful booking of flat for {dateFrom} to {dateTo}
                </Text>

                <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={goToCurrentBookings}>
                  <Text style={styles.actionText}>See my bookings</Text>
                </Pressable>

                <View style={{ height: 20 }} />
              </ScrollView>
            ) : null}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },

  countPill: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: { color: "#fff", fontWeight: "900" },

  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },

  empty: { marginTop: 80, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  emptySub: { color: "#6B7280", fontWeight: "700", textAlign: "center" },

  clearBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  clearBtnText: { fontWeight: "900", color: "#111827" },

  actionsInline: { flexDirection: "row", gap: 10 },

  bookBtn: {
    backgroundColor: "#FACC15",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  bookBtnText: { fontWeight: "900", color: "#111827" },

  removeBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  removeBtnText: { fontWeight: "900", color: "#B91C1C" },

  // Flow
  flowSafe: { flex: 1, backgroundColor: "#FFFBEB" },
  flowHeader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flowTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  flowClose: { fontWeight: "900", color: "#2563EB" },

  flowContent: { paddingHorizontal: 16, paddingBottom: 16 },

  flowCarTitle: { marginTop: 8, fontWeight: "900", color: "#111827", fontSize: 20 },

  fieldLabel: { marginTop: 14, marginBottom: 6, color: "#111827", fontWeight: "900" },

  calendarWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  flowActions: { marginTop: 18, flexDirection: "row", gap: 10 },

  actionBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1 },
  actionPrimary: { backgroundColor: "#FACC15", borderColor: "#F59E0B" },
  actionGhost: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
  actionText: { fontWeight: "900", color: "#111827" },
  actionGhostText: { color: "#111827" },

  successText: { marginTop: 12, marginBottom: 16, fontWeight: "900", color: "#16A34A" },

  partnerBox: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  partnerTitle: { fontWeight: "900", color: "#111827" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { color: "#6B7280", fontWeight: "800" },

  // Flat cards
  flatCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
    marginTop: 6,
  },
  flatCarouselWrap: { position: "relative" },
flatImage: {
  width: SCREEN_WIDTH - 32,
  height: 170,
  backgroundColor: "#FEF3C7",
},

  noImageWrap: { position: "relative" },
  noImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
  },
  noImageText: { color: "#fff", fontWeight: "900" },

  dotsRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  dotActive: { backgroundColor: "rgba(255,255,255,0.95)" },

  flatBody: { padding: 14 },
  flatTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  flatSub: { marginTop: 4, color: "#6B7280", fontWeight: "800" },
  flatMetaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  flatMeta: { fontWeight: "900", color: "#111827" },
  flatHint: { marginTop: 10, color: "#9CA3AF", fontWeight: "800" },

  flowActionsFixed: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    gap: 10,
  },
});
