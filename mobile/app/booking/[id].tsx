// mobile/app/booking/[id].tsx
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
import { ApiError } from "../../lib/api/apiClient";

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

import { removeFlatlyBooking } from "../../lib/storage/flatlyBookingsStorage";

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

export default function BookingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [flatlyDetails, setFlatlyDetails] = useState<FlatlyBookingDetailsResponse | null>(null);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  const isFlat = useMemo(() => (id ? isFlatlyId(id) : false), [id]);

  const flatBookingId = useMemo(() => {
    if (!id) return "";
    return isFlat ? flatlyBookingIdFromRoute(id) : "";
  }, [id, isFlat]);

  useEffect(() => {
    (async () => {
      if (!id) return;

      setLoading(true);
      setPartnerError(null);
      setBooking(null);
      setFlatlyDetails(null);

      try {
        if (!isFlat) {
          const b = await getBookingByIdFromBackend(id);
          setBooking(b);
          return;
        }

        if (!flatBookingId) {
          setPartnerError("Invalid Flatly booking id.");
          return;
        }

        try {
          const dto = await getFlatBookingDetails(flatBookingId);
          setFlatlyDetails(dto);
        } catch {
          setPartnerError("Couldn’t load Flatly booking details (partner API might be down).");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isFlat, flatBookingId]);

  async function onCancelPress() {
    if (!id) return;

    Alert.alert(
      "Cancel booking?",
      isFlat
        ? "Are you sure? This will cancel the Flatly booking and it will disappear from your list."
        : "Are you sure? This will move it to History as Cancelled.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            try {
              if (isFlat) {
                if (!flatBookingId) throw new Error("Invalid Flatly booking id.");

                try {
                  await cancelFlatlyBooking(flatBookingId);
                } catch (e: any) {
                  if (e instanceof ApiError && e.status === 422) {
                    Alert.alert(
                      "Cancel failed",
                      "There was a mistake contacting the partner API (422). Your booking was NOT cancelled."
                    );
                    return;
                  }

                  Alert.alert(
                    "Cancel failed",
                    "Flatly partner API seems unavailable right now. Please try again later."
                  );
                  return;
                }

                // ✅ Requirement #2: remove it completely from local + UI
                await removeFlatlyBooking(flatBookingId);

                Alert.alert("Cancelled", "Your Flat booking was cancelled.");
                router.replace({
                  pathname: "/(tabs)/home",
                  params: { section: "current" },
                });
                return;
              }

              await cancelCarBookingOnBackend(id);

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

  const hasAny = Boolean(booking || flatlyDetails);

  const cancelled = useMemo(() => {
    // Flatly cancelled booking disappears entirely, so if you're still here, it's not cancelled.
    if (isFlat) return false;
    return booking?.state === "Cancelled";
  }, [booking, isFlat]);

  const showCancel = useMemo(() => {
    if (cancelled) return false;
    if (!isFlat) return booking?.status === "current";
    return !!flatlyDetails; // only if we actually loaded it
  }, [cancelled, isFlat, booking, flatlyDetails]);

  const statusLabel = cancelled ? "❌ Cancelled" : "✅ Booked";

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

  const carFooterLeft =
    typeof booking?.car?.pricePerDay === "number" && booking?.car?.currency
      ? `${booking.car.pricePerDay} ${booking.car.currency} / day`
      : undefined;

  const flatTitle = useMemo(() => safeText((flatlyDetails?.flat as any)?.name, "Flat"), [flatlyDetails]);

  const flatSubtitle = useMemo(() => {
    const city = safeText((flatlyDetails?.flat as any)?.city, "—");
    const country = safeText((flatlyDetails?.flat as any)?.country, "—");
    return `${city}, ${country}`;
  }, [flatlyDetails]);

  const flatImages = useMemo(() => {
    const urls =
      Array.isArray(flatlyDetails?.flatImages) && flatlyDetails?.flatImages?.length
        ? flatlyDetails.flatImages
            .map((x: any) => String(x?.image_url ?? "").trim())
            .filter(Boolean)
        : [];
    return urls;
  }, [flatlyDetails]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Booking</Text>

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

        {partnerError ? (
          <View style={styles.warnCard}>
            <Text style={styles.warnTitle}>Heads up</Text>
            <Text style={styles.warnText}>{partnerError}</Text>
          </View>
        ) : null}

        {!loading && !hasAny ? <Text style={styles.notFound}>Booking not found.</Text> : null}

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
              {booking.cancelledAtISO ? <Text style={styles.hint}>cancelled at: {dateOnly(booking.cancelledAtISO)}</Text> : null}
            </View>
          </>
        ) : null}

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
              <Text style={styles.line}>City: {safeText((flatlyDetails.flat as any)?.city, "—")}</Text>
              <Text style={styles.line}>Country: {safeText((flatlyDetails.flat as any)?.country, "—")}</Text>
              <Text style={styles.line}>Guests: {safeText((flatlyDetails.booking as any)?.guestsCount, "—")}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.line}>id: {flatBookingId}</Text>
              <Text style={styles.line}>status: {cancelled ? "Cancelled" : "Booked"}</Text>
              <Text style={styles.line}>
                dates: {safeText((flatlyDetails.booking as any)?.checkInDate, "—")} -{" "}
                {safeText((flatlyDetails.booking as any)?.checkOutDate, "—")}
              </Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },
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
