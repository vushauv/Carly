// app/booking/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CarCardView from "../components/CarCardView";
import { getBookingByIdFromBackend, type Booking } from "../../lib/bookingsApi";

function dateOnly(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "—";
  // "2025-02-18T12:00:00+01:00" -> "2025-02-18"
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

export default function BookingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const b = await getBookingByIdFromBackend(id);
      setBooking(b);
    })();
  }, [id]);

  const cancelled = booking?.state === "Cancelled";

  const carTitle = useMemo(() => {
    if (!booking?.car) return "";
    return `${booking.car.brand} ${booking.car.model}`.trim();
  }, [booking]);

  const carSubtitle = useMemo(() => {
    if (!booking?.car) return "";
    const fuel = booking.car.fuelType ? String(booking.car.fuelType) : "";
    const color = booking.car.color ? String(booking.car.color) : "";
    const combo = [fuel, color].filter(Boolean).join(" • ");
    return combo || null;
  }, [booking]);

  const carImages = useMemo(() => {
    const imgs = booking?.car?.images ?? [];
    return Array.isArray(imgs) ? imgs : [];
  }, [booking]);

  const footerLeft = useMemo(() => {
    const p = booking?.car?.pricePerDay;
    const c = booking?.car?.currency;
    if (typeof p === "number" && c) return `${p} ${c} / day`;
    if (typeof p === "number") return `${p} / day`;
    return "";
  }, [booking]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFBEB" }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Booking details</Text>

        {!booking ? (
          <Text style={styles.notFound}>Booking not found.</Text>
        ) : (
          <>
            {/* ✅ Car details like Search (card + extra info) */}
            {booking.car ? (
              <>
                <CarCardView
                  title={carTitle || "Car"}
                  subtitle={carSubtitle}
                  images={carImages}
                  fallbackSource={require("../../assets/images/no-images.png")}
                  metaLeft={booking.car.fuelType ? `⛽ ${booking.car.fuelType}` : "🚗 Car"}
                  metaRight={cancelled ? "❌ Cancelled" : "✅ Booked"}
                  footerLeft={footerLeft}
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

            {/* ✅ Booking metadata (no "list:", and "state" renamed to "status") */}
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    flexGrow: 1,
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
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },

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
