//mobile/app/booking/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import CarCardView from "../components/CarCardView";

import {
  cancelCarBookingOnBackend,
  getBookingByIdFromBackend,
  type Booking,
} from "../../lib/api/bookingsApi";

import {
  cancelFlatlyBooking,
  getFlatBookingDetails,
  type FlatlyBookingDetailsResponse,
} from "../../lib/api/flatlyApi";

// -----------------------------
// Helpers
// -----------------------------
function dateOnly(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "—";
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

function isFlatlyId(id: string): boolean {
  return String(id ?? "").startsWith("flatly-");
}

function flatlyBookingIdFromRoute(id: string): string {
  return String(id ?? "").replace("flatly-", "").trim();
}

function safeText(v: unknown, fallback = "—"): string {
  const s = String(v ?? "").trim();
  return s.length ? s : fallback;
}

// -----------------------------
// Screen
// -----------------------------
export default function BookingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);

  // Carly booking (car booking)
  const [booking, setBooking] = useState<Booking | null>(null);

  // Flatly booking details (from partner endpoint)
  const [flatlyDetails, setFlatlyDetails] = useState<FlatlyBookingDetailsResponse | null>(null);

  // Partner API error message (shown in UI)
  const [partnerError, setPartnerError] = useState<string | null>(null);

  // Local cancellation flag for Flatly bookings (Flatly details schema doesn't include status)
  const [flatlyCancelledAtISO, setFlatlyCancelledAtISO] = useState<string | null>(null);

  const isFlat = useMemo(() => (id ? isFlatlyId(id) : false), [id]);

  const flatBookingId = useMemo(() => {
    if (!id) return "";
    return isFlat ? flatlyBookingIdFromRoute(id) : "";
  }, [id, isFlat]);

  // -----------------------------
  // Load logic: car vs flatly
  // -----------------------------
  useEffect(() => {
    (async () => {
      if (!id) return;

      setLoading(true);
      setPartnerError(null);
      setBooking(null);
      setFlatlyDetails(null);
      setFlatlyCancelledAtISO(null);

      try {
        if (!isFlat) {
          // Carly booking
          const b = await getBookingByIdFromBackend(id);
          setBooking(b);
          return;
        }

        // Flatly booking (UUID)
        if (!flatBookingId) {
          setPartnerError("Invalid Flatly booking id.");
          return;
        }

        try {
          const dto = await getFlatBookingDetails(flatBookingId);
          setFlatlyDetails(dto);
        } catch (e: any) {
          setPartnerError(
            "Couldn’t load Flatly booking details (partner API might be down)."
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isFlat]);

  // -----------------------------
  // Cancel handler
  // -----------------------------
  async function onCancelPress() {
    if (!id) return;

    Alert.alert(
      "Cancel booking?",
      "Are you sure? This will move it to History as Cancelled.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            try {
              if (isFlat) {
                if (!flatBookingId) throw new Error("Invalid Flatly booking id.");
                await cancelFlatlyBooking(flatBookingId);
                if (!flatBookingId) throw new Error("Invalid Flatly booking id.");

                try {
                  await cancelFlatlyBooking(flatBookingId);
                } catch (e: any) {
                  Alert.alert(
                    "Cancel failed",
                    "Flatly partner API seems unavailable right now. Please try again later."
                  );
                  return;
                }

                setFlatlyCancelledAtISO(new Date().toISOString());
                Alert.alert("Cancelled", "Your Flat booking was cancelled.");
                return;
              }

              // Carly booking cancel (car booking)
              await cancelCarBookingOnBackend(id);

              // Reload booking details (best-effort)
              const b = await getBookingByIdFromBackend(id);
              setBooking(b);

              Alert.alert("Cancelled", "Your car booking was cancelled.");
            } catch (e: any) {
              Alert.alert("Cancel failed", e?.message ?? "Unknown error");
            }
          },
        },
      ]
    );
  }

  // -----------------------------
  // Derived UI bits
  // -----------------------------
  const cancelled = useMemo(() => {
    if (!isFlat) return booking?.state === "Cancelled";
    return !!flatlyCancelledAtISO;
  }, [booking, isFlat, flatlyCancelledAtISO]);

  const showCancel = useMemo(() => {
    if (cancelled) return false;
    // car booking is current -> show cancel; flatly bookings always treated as cancellable unless already cancelled
    if (!isFlat) return booking?.status === "current";
    return !!flatlyDetails; // only if we actually loaded it
  }, [cancelled, isFlat, booking, flatlyDetails]);

  const statusLabel = cancelled ? "❌ Cancelled" : "✅ Booked";

  // Carly car booking derived fields
  const carTitle = useMemo(() => {
    if (!booking?.car) return "";
    return `${booking.car.brand} ${booking.car.model}`.trim();
  }, [booking]);

  const carSubtitle = useMemo(() => {
    if (!booking?.car) return null;
    const fuel = booking.car.fuelType ? String(booking.car.fuelType) : "";
    const color = booking.car.color ? String(booking.car.color) : "";
    const combo = [fuel, color].filter(Boolean).join(" • ");
    return combo || null;
  }, [booking]);

  const carImages = useMemo(() => {
    const imgs = booking?.car?.images ?? [];
    return Array.isArray(imgs) ? imgs : [];
  }, [booking]);

  const carFooterLeft = useMemo(() => {
    const p = booking?.car?.pricePerDay;
    const c = booking?.car?.currency;
    if (typeof p === "number" && c) return `${p} ${c} / day`;
    if (typeof p === "number") return `${p} / day`;
    return "";
  }, [booking]);

  // Flatly derived fields
  const flatTitle = useMemo(() => {
    const f = flatlyDetails?.flat;
    return safeText(f?.name ?? "Flat", "Flat");
  }, [flatlyDetails]);

  const flatSubtitle = useMemo(() => {
    const f = flatlyDetails?.flat;
    const address = safeText(f?.address_line ?? f?.location ?? "—", "—");
    const city = safeText(f?.city ?? "—", "—");
    return `${address} • ${city}`;
  }, [flatlyDetails]);

  const flatImages = useMemo(() => {
    const imgs =
      Array.isArray(flatlyDetails?.flatImages) && flatlyDetails!.flatImages.length
        ? flatlyDetails!.flatImages
            .map((x: any) => String(x?.image_url ?? "").trim())
            .filter(Boolean)
        : [];
    return imgs;
  }, [flatlyDetails]);

  const flatDates = useMemo(() => {
    const b = flatlyDetails?.booking;
    // booking has checkInDate/checkOutDate per your API schema usage in other screens
    const from = safeText(b?.checkInDate, "");
    const to = safeText(b?.checkOutDate, "");
    return {
      from: from ? dateOnly(from) : "—",
      to: to ? dateOnly(to) : "—",
    };
  }, [flatlyDetails]);

  const hasAny = !!booking || !!flatlyDetails;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFBEB" }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Booking details</Text>

          {showCancel ? (
            <Pressable style={styles.cancelBtn} onPress={onCancelPress}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading…</Text>
          </View>
        ) : null}

        {/* Partner API warning (Flatly) */}
        {partnerError ? (
          <View style={styles.warnCard}>
            <Text style={styles.warnTitle}>Heads up</Text>
            <Text style={styles.warnText}>{partnerError}</Text>
          </View>
        ) : null}

        {!loading && !hasAny ? (
          <Text style={styles.notFound}>Booking not found.</Text>
        ) : null}

        {/* Carly booking (Car booking details) */}
        {!loading && booking ? (
          <>
            {booking.car ? (
              <>
                <CarCardView
                  title={carTitle || "Car"}
                  subtitle={carSubtitle}
                  images={carImages}
                  fallbackSource={require("../../assets/images/no-images.png")}
                  metaLeft={booking.car.fuelType ? `⛽ ${booking.car.fuelType}` : "🚗 Car"}
                  metaRight={statusLabel}
                  footerLeft={carFooterLeft}
                  imageHeight={240}
                />

                <View style={styles.infoCard}>
                  <Text style={styles.line}>Brand: {booking.car.brand}</Text>
                  <Text style={styles.line}>Model: {booking.car.model}</Text>
                  {booking.car.fuelType ? <Text style={styles.line}>Fuel: {booking.car.fuelType}</Text> : null}
                  {booking.car.color ? <Text style={styles.line}>Color: {booking.car.color}</Text> : null}
                </View>
              </>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.line}>id: {booking.id}</Text>
              <Text style={styles.line}>status: {booking.state}</Text>
              <Text style={styles.line}>
                dates: {dateOnly(booking.startDate)} - {dateOnly(booking.endDate)}
              </Text>
              {booking.cancelledAtISO ? (
                <Text style={styles.hint}>cancelled at: {dateOnly(booking.cancelledAtISO)}</Text>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Flatly booking details */}
        {!loading && flatlyDetails ? (
          <>
            <CarCardView
              title={flatTitle}
              subtitle={flatSubtitle}
              images={flatImages}
              fallbackSource={require("../../assets/images/no-images.png")}
              metaLeft={"🏠 Flat"}
              metaRight={statusLabel}
              imageHeight={240}
            />

            <View style={styles.infoCard}>
              <Text style={styles.line}>
                City: {safeText(flatlyDetails.flat?.city, "—")}
              </Text>
              <Text style={styles.line}>
                Country: {safeText(flatlyDetails.flat?.country, "—")}
              </Text>
              <Text style={styles.line}>
                Guests: {safeText(flatlyDetails.booking?.guestsCount, "—")}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.line}>id: {flatBookingId}</Text>
              <Text style={styles.line}>status: {cancelled ? "Cancelled" : "Booked"}</Text>
              <Text style={styles.line}>
                dates: {flatDates.from} - {flatDates.to}
              </Text>
              {flatlyCancelledAtISO ? (
                <Text style={styles.hint}>cancelled at: {dateOnly(flatlyCancelledAtISO)}</Text>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 20, gap: 12 },

  backBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  backText: { fontWeight: "900", color: "#111827" },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "900", color: "#111827" },

  cancelBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  cancelBtnText: { fontWeight: "900", color: "#B91C1C" },

  loadingWrap: { paddingVertical: 14, alignItems: "center", gap: 8 },
  muted: { color: "#6B7280", fontWeight: "800" },

  warnCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 14,
    gap: 6,
  },
  warnTitle: { fontWeight: "900", color: "#991B1B", fontSize: 18 },
  warnText: { color: "#991B1B", fontWeight: "800" },

  notFound: { color: "#6B7280", fontWeight: "800" },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 6,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 6,
  },

  line: { fontWeight: "800", color: "#111827" },
  hint: { color: "#6B7280", fontWeight: "800" },
});
