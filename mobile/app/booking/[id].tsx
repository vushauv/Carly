//mobile/app/booking/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import CarCardView from "../components/CarCardView";

import {
  cancelCarBookingOnBackend,
  getBookingByIdFromBackend,
  type Booking,
} from "../../lib/api/bookingsApi";

import { cancelFlatlyBooking, getFlatBookingDetails, getFlatDetails } from "../../lib/api/flatlyApi";
import { getFlatlyBookings, markFlatlyCancelled, type FlatlyBookingRecord } from "../../lib/storage/flatlyBookingsStorage";
import type { FlatCard } from "../../lib/models";

// -----------------------------
// Helpers
// -----------------------------
function dateOnly(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "—";
  // "2025-02-18T12:00:00+01:00" -> "2025-02-18"
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

function isFlatlyId(id: string): boolean {
  return String(id ?? "").startsWith("flatly-");
}

function parseFlatlyBookingId(id: string): number | null {
  const raw = String(id ?? "").replace("flatly-", "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// Minimal mapping from Flatly dto -> FlatCard (same spirit as lib/flatlyApi.ts)
function placeholder(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/600`;
}

function pickPricePerNight(dto: any): number {
  const rules = Array.isArray(dto?.pricing) ? dto.pricing : [];
  const active = rules.find((r: any) => r?.is_active && typeof r.price_per_night === "number");
  const anyRule = rules.find((r: any) => typeof r?.price_per_night === "number");
  return (active?.price_per_night ?? anyRule?.price_per_night ?? 0) as number;
}

function mapFlatDtoToCard(dto: any): FlatCard {
  const id = String(dto?.id ?? "");
  const title = String(dto?.name ?? "Flat").trim() || "Flat";
  const addressLine = String(dto?.address_line ?? dto?.location ?? "—").trim() || "—";
  const city = String(dto?.city ?? "—").trim() || "—";

  const imgsRaw = Array.isArray(dto?.images) ? dto.images : [];
  const urls = imgsRaw
    .map((x: any) => String(x?.image_url ?? "").trim())
    .filter((u: string) => u.length > 0);

  const imageUrls = urls.length ? urls : [placeholder(`flat_${id}`)];

  return {
    id,
    title,
    addressLine,
    city,
    currency: "PLN",
    pricePerNight: pickPricePerNight(dto),
    imageUrls,
    raw: dto,
  };
}

// -----------------------------
// Screen
// -----------------------------
export default function BookingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);

  // For Carly bookings (car booking)
  const [booking, setBooking] = useState<Booking | null>(null);

  // For Flatly bookings
  const [flatlyRec, setFlatlyRec] = useState<FlatlyBookingRecord | null>(null);
  const [flatCard, setFlatCard] = useState<FlatCard | null>(null);

  // Partner API error message (shown in UI)
  const [partnerError, setPartnerError] = useState<string | null>(null);

  const cancelled =
    (booking?.state === "Cancelled") ||
    (flatlyRec?.status === "CANCELLED");

  const showCancel =
    !cancelled &&
    (
      // car booking is "current"
      (booking?.status === "current") ||
      // flatly record is not cancelled (and we treat it as current)
      (!!flatlyRec && flatlyRec.status !== "CANCELLED")
    );

  // Load logic: car vs flatly
  useEffect(() => {
    (async () => {
      if (!id) return;

      setLoading(true);
      setPartnerError(null);
      setBooking(null);
      setFlatlyRec(null);
      setFlatCard(null);

      try {
        if (!isFlatlyId(id)) {
          // Carly booking (numeric)
          const b = await getBookingByIdFromBackend(id);
          setBooking(b);
          return;
        }

        // Flatly booking
        const flatBookingId = parseFlatlyBookingId(id);
        if (!flatBookingId) {
          setPartnerError("Invalid Flatly booking id.");
          return;
        }

        // 1) Read local snapshot first (so UI can render even if partner API is down)
        const all = await getFlatlyBookings();
        const rec = all.find((x) => x.flatBookingId === flatBookingId) ?? null;
        setFlatlyRec(rec);

        // If we have snapshot, use it immediately
        if (rec?.flatSnapshot) {
          setFlatCard({
            id: String(rec.flatId),
            title: rec.flatSnapshot.title,
            addressLine: rec.flatSnapshot.addressLine,
            city: rec.flatSnapshot.city,
            currency: rec.flatSnapshot.currency,
            pricePerNight: rec.flatSnapshot.pricePerNight,
            imageUrls: rec.flatSnapshot.imageUrls,
            raw: rec.flatSnapshot,
          });
        }

        // 2) Best-effort dynamic download (partner API can be down)
        //    booking details -> gives flatId (authoritative)
        try {
          const bookingDto = await getFlatBookingDetails(flatBookingId);

          const flatId =
            Number(bookingDto?.flat_id ?? bookingDto?.flatId ?? rec?.flatId);

          if (Number.isFinite(flatId)) {
            const flatDto = await getFlatDetails(flatId);
            const card = mapFlatDtoToCard(flatDto);
            setFlatCard(card);

            // If local record was missing, synthesize minimal one for UI
            if (!rec) {
              setFlatlyRec({
                flatBookingId,
                flatId,
                dateFromDayISO: dateOnly(bookingDto?.date_from ?? bookingDto?.dateFrom),
                dateToDayISO: dateOnly(bookingDto?.date_to ?? bookingDto?.dateTo),
                status: "CREATED",
                flatSnapshot: {
                  title: card.title,
                  addressLine: card.addressLine,
                  city: card.city,
                  imageUrls: card.imageUrls,
                  currency: card.currency,
                  pricePerNight: card.pricePerNight,
                },
                createdAtISO: new Date().toISOString(),
              });
            }
          }
        } catch (e: any) {
          // Partner API unavailable (or any other failure)
          setPartnerError(
            "Couldn’t load live Flatly details (partner API might be down). Showing cached info if available."
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
              if (isFlatlyId(id)) {
                const flatBookingId = parseFlatlyBookingId(id);
                if (!flatBookingId) throw new Error("Invalid Flatly booking id.");

                try {
                  // Partner cancel (can fail)
                  await cancelFlatlyBooking(flatBookingId);
                } catch (e: any) {
                  // IMPORTANT: show message if partner API is unavailable
                  Alert.alert(
                    "Cancel failed",
                    "Flatly partner API seems unavailable right now. Please try again later."
                  );
                  return;
                }

                // Local mark cancelled
                await markFlatlyCancelled(flatBookingId);

                // Update UI immediately
                setFlatlyRec((prev) =>
                  prev ? { ...prev, status: "CANCELLED", cancelledAtISO: new Date().toISOString() } : prev
                );

                Alert.alert("Cancelled", "Your Flat booking was cancelled.");
                return;
              }

              // Carly booking cancel (car booking)
              await cancelCarBookingOnBackend(id);

              // Reload the booking details (best-effort)
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

  const flatTitle = useMemo(() => {
    if (!flatCard && flatlyRec?.flatSnapshot) return flatlyRec.flatSnapshot.title;
    if (!flatCard) return "Flat";
    return flatCard.title;
  }, [flatCard, flatlyRec]);

  const flatSubtitle = useMemo(() => {
    if (!flatCard && flatlyRec?.flatSnapshot) {
      return `${flatlyRec.flatSnapshot.addressLine} • ${flatlyRec.flatSnapshot.city}`;
    }
    if (!flatCard) return null;
    return `${flatCard.addressLine} • ${flatCard.city}`;
  }, [flatCard, flatlyRec]);

  const flatImages = useMemo(() => {
    const urls =
      flatCard?.imageUrls ??
      flatlyRec?.flatSnapshot?.imageUrls ??
      [];
    return Array.isArray(urls) ? urls : [];
  }, [flatCard, flatlyRec]);

  const flatFooterLeft = useMemo(() => {
    const currency = flatCard?.currency ?? flatlyRec?.flatSnapshot?.currency;
    const price = flatCard?.pricePerNight ?? flatlyRec?.flatSnapshot?.pricePerNight;
    if (typeof price === "number" && currency) return `${price} ${currency} / night`;
    if (typeof price === "number") return `${price} / night`;
    return "";
  }, [flatCard, flatlyRec]);

  const statusLabel = cancelled ? "❌ Cancelled" : "✅ Booked";

  // -----------------------------
  // Render
  // -----------------------------
  const hasAny = !!booking || !!flatlyRec || !!flatCard;

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
        {!loading && (flatlyRec || flatCard) ? (
          <>
            <CarCardView
              title={flatTitle}
              subtitle={flatSubtitle}
              images={flatImages}
              fallbackSource={require("../../assets/images/no-images.png")}
              metaLeft={"🏠 Flat"}
              metaRight={statusLabel}
              footerLeft={flatFooterLeft}
              imageHeight={240}
            />

            <View style={styles.infoCard}>
              <Text style={styles.line}>
                Address: {flatCard ? `${flatCard.addressLine}, ${flatCard.city}` : "—"}
              </Text>
              {typeof (flatCard?.pricePerNight ?? flatlyRec?.flatSnapshot?.pricePerNight) === "number" ? (
                <Text style={styles.line}>
                  Price: {flatFooterLeft}
                </Text>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.line}>id: {id}</Text>
              <Text style={styles.line}>status: {cancelled ? "Cancelled" : "Booked"}</Text>

              <Text style={styles.line}>
                dates: {dateOnly(flatlyRec?.dateFromDayISO)} - {dateOnly(flatlyRec?.dateToDayISO)}
              </Text>

              {flatlyRec?.cancelledAtISO ? (
                <Text style={styles.hint}>cancelled at: {dateOnly(flatlyRec.cancelledAtISO)}</Text>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// -----------------------------
// Styles
// -----------------------------
const styles = StyleSheet.create({
  page: {
    padding: 16,
    flexGrow: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
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

  title: { fontSize: 22, fontWeight: "900", color: "#111827", flex: 1 },

  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "900",
  },

  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  muted: { color: "#6B7280", fontWeight: "800" },

  warnCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    gap: 6,
  },
  warnTitle: { fontWeight: "900", color: "#991B1B" },
  warnText: { fontWeight: "800", color: "#7F1D1D" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 6,
  },

  line: { fontWeight: "800", color: "#111827" },
  hint: { color: "#6B7280", marginTop: 8, fontWeight: "800" },
  notFound: { color: "#6B7280", fontWeight: "800" },
});
