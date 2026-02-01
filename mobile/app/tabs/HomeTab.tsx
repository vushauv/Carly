// app/tabs/HomeTab.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import CarCardView from "../components/CarCardView";
import { useLocalSearchParams } from "expo-router";
import { cancelFlatlyBooking } from "../../lib/flatlyApi";
import { getFlatlyBookings, markFlatlyCancelled } from "../../lib/flatlyBookingsStorage";

import {
  cancelCarBookingOnBackend,
  getBookingsFromBackend,
  type Booking,
  type BookingStatus,
} from "../../lib/bookingsApi";


export default function HomeTab() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section?: "current" | "history" }>();

  const [selected, setSelected] = useState<BookingStatus>("current");
  const [all, setAll] = useState<Booking[]>([]);

  const load = useCallback(async () => {
    const carBookings = await getBookingsFromBackend();

    const flatly = await getFlatlyBookings();
    const flatBookings: Booking[] = flatly.map((fb) => {
      const cancelled = fb.status === "CANCELLED";
      return {
        id: `flatly-${fb.flatBookingId}`, // keep unique + routeable
        status: cancelled ? "history" : "current",
        state: cancelled ? "Cancelled" : "Booked",
        startDate: fb.dateFromDayISO,
        endDate: fb.dateToDayISO,
        car: undefined,
        flat: fb.flatSnapshot
          ? {
              address: `${fb.flatSnapshot.addressLine}, ${fb.flatSnapshot.city}`,
              images: fb.flatSnapshot.imageUrls,
            }
          : {
              address: `Flat #${fb.flatId}`,
              images: [],
            },
        createdAtISO: fb.createdAtISO,
        cancelledAtISO: fb.cancelledAtISO,
      };
    });

    const merged = [...carBookings, ...flatBookings];

    // optional: newest first by createdAtISO (or fallback)
    merged.sort((a, b) => String(b.createdAtISO ?? "").localeCompare(String(a.createdAtISO ?? "")));

    setAll(merged);

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

    useEffect(() => {
      if (section === "current" || section === "history") {
        setSelected(section);
      }
    }, [section]);


  const bookings = useMemo(() => all.filter((b) => b.status === selected), [all, selected]);

  async function onCancel(id: string) {
    const isFlatly = id.startsWith("flatly-");

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
              if (isFlatly) {
                const raw = id.replace("flatly-", "");
                const flatBookingId = Number(raw);

                if (!Number.isFinite(flatBookingId)) {
                  Alert.alert("Cancel failed", "Invalid Flatly booking id.");
                  return;
                }

                // Partner cancel (can fail / be down) -> catch and show friendly message
                try {
                  await cancelFlatlyBooking(flatBookingId);
                } catch (e: any) {
                  Alert.alert(
                    "Cancel failed",
                    "Flatly partner API seems unavailable right now (or booking was not found). Please try again later."
                  );
                  return; // IMPORTANT: don't mark local cancelled
                }

                // Only mark locally cancelled after partner cancel succeeds
                await markFlatlyCancelled(flatBookingId);
              } else {
                // Carly car cancel
                try {
                  await cancelCarBookingOnBackend(id);
                } catch (e: any) {
                  Alert.alert("Cancel failed", e?.message ?? "Could not cancel car booking.");
                  return;
                }
              }

              // Refresh UI after successful cancel
              await load();
              Alert.alert("Cancelled", "Your booking was cancelled.");
            } catch (e: any) {
              // Last-resort catch so nothing becomes "Uncaught (in promise)"
              Alert.alert("Cancel failed", e?.message ?? "Unknown error");
            }
          },
        },
      ]
    );
  }



  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>

        <Pressable style={styles.profileButton} onPress={() => router.push("../ProfileSettings")}>
          <Text style={styles.profileButtonText}>Profile settings</Text>
        </Pressable>
      </View>

      <View style={styles.segmentWrap}>
        <Text style={styles.sectionLabel}>View bookings:</Text>

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentBtn, selected === "current" && styles.segmentBtnActive]}
            onPress={() => setSelected("current")}
          >
            <Text style={[styles.segmentText, selected === "current" && styles.segmentTextActive]}>current</Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, selected === "history" && styles.segmentBtnActive]}
            onPress={() => setSelected("history")}
          >
            <Text style={[styles.segmentText, selected === "history" && styles.segmentTextActive]}>history</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onSeeMore={() => router.push(`../booking/${b.id}`)}
            onCancel={() => void onCancel(b.id)}
          />
        ))}

        {bookings.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.mutedText}>No bookings to show.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function dateOnly(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "—";
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

function BookingCard({
  booking,
  onSeeMore,
  onCancel,
}: {
  booking: Booking;
  onSeeMore: () => void;
  onCancel: () => void;
}) {
  const cancelled = booking.state === "Cancelled";

  const carSubtitle =
    booking.car?.fuelType || booking.car?.color
      ? [booking.car?.fuelType, booking.car?.color].filter(Boolean).join(" • ")
      : null;

  return (
    <View style={styles.card}>
      {booking.car && booking.flat ? (
        <>
          <CarCardView
            title={`${booking.car.brand} ${booking.car.model}`}
            subtitle={carSubtitle}
            images={booking.car.images}
            fallbackSource={require("../../assets/images/no-images.png")}
            metaLeft={booking.car.fuelType ? `⛽ ${booking.car.fuelType}` : "🚗 Car"}
            metaRight={cancelled ? "❌ Cancelled" : "✅ Booked"}
            footerLeft={
              typeof booking.car.pricePerDay === "number" && booking.car.currency
                ? `${booking.car.pricePerDay} ${booking.car.currency} / day`
                : undefined
            }
            imageHeight={200}
          />

          <View style={styles.sectionDivider} />

          <CarCardView
            title={booking.flat.address}
            subtitle={"Flat"}
            images={booking.flat.images}
            fallbackSource={require("../../assets/images/no-images.png")}
            metaLeft={"🏠 Flat"}
            metaRight={cancelled ? "❌ Cancelled" : "✅ Booked"}
            imageHeight={200}
          />
        </>
      ) : booking.car ? (
        <CarCardView
          title={`${booking.car.brand} ${booking.car.model}`}
          subtitle={carSubtitle}
          images={booking.car.images}
          fallbackSource={require("../../assets/images/no-images.png")}
          metaLeft={booking.car.fuelType ? `⛽ ${booking.car.fuelType}` : "🚗 Car"}
          metaRight={cancelled ? "❌ Cancelled" : "✅ Booked"}
          footerLeft={
            typeof booking.car.pricePerDay === "number" && booking.car.currency
              ? `${booking.car.pricePerDay} ${booking.car.currency} / day`
              : undefined
          }
          imageHeight={200}
        />
      ) : booking.flat ? (
        <CarCardView
          title={booking.flat.address}
          subtitle={"Flat"}
          images={booking.flat.images}
          fallbackSource={require("../../assets/images/no-images.png")}
          metaLeft={"🏠 Flat"}
          metaRight={cancelled ? "❌ Cancelled" : "✅ Booked"}
          imageHeight={200}
        />
      ) : null}

      <View style={styles.bottomInfo}>
        <View style={styles.bottomRow}>
          <Text style={styles.metaText}>
            {dateOnly(booking.startDate)} - {dateOnly(booking.endDate)}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <Pressable onPress={onSeeMore}>
            <Text style={styles.linkText}>see more</Text>
          </Pressable>

          {booking.status === "current" ? (
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#111827" },

  profileButton: {
    backgroundColor: "#FACC15",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  profileButtonText: { color: "#111827", fontWeight: "900" },

  segmentWrap: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  sectionLabel: { color: "#6B7280", fontWeight: "800" },
  segment: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  segmentBtnActive: { backgroundColor: "#FACC15" },
  segmentText: { fontWeight: "900", color: "#111827" },
  segmentTextActive: { color: "#111827" },

  body: { flex: 1, paddingHorizontal: 16 },
  list: { paddingBottom: 16, gap: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#FDE68A",
    marginVertical: 2,
  },

  bottomInfo: { gap: 10 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaText: { color: "#6B7280", fontWeight: "800" },
  stars: { fontWeight: "900", color: "#111827" },

  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { fontWeight: "900", color: "#2563EB" },

  cancelBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  cancelBtnText: { fontWeight: "900", color: "#B91C1C" },

  emptyWrap: { paddingVertical: 24, alignItems: "center" },
  mutedText: { color: "#6B7280", fontWeight: "800" },
});

