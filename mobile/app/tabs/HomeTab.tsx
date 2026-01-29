// app/tabs/HomeTab.tsx
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CarCardView from "../components/CarCardView";

type BookingStatus = "current" | "history";

type Car = {
  brand: string;
  model: string;
  plate: string;
  images: string[];
};

type Flat = {
  address: string;
  images: string[];
};

type Booking = {
  id: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  car?: Car;
  flat?: Flat;
  rating?: number;
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    status: "current",
    startDate: "2026-02-01",
    endDate: "2026-02-10",
    car: {
      brand: "VW",
      model: "Golf",
      plate: "WZ 12345",
      images: [
        "https://picsum.photos/seed/car_b1_1/900/600",
        "https://picsum.photos/seed/car_b1_2/900/600",
      ],
    },
  },
  {
    id: "b2",
    status: "current",
    startDate: "2026-03-03",
    endDate: "2026-03-07",
    car: {
      brand: "BMW",
      model: "X1",
      plate: "WX 99887",
      images: [],
    },
    flat: {
      address: "Sesame Street 123",
      images: ["https://picsum.photos/seed/flat_b2_1/900/600"],
    },
  },
  {
    id: "b3",
    status: "history",
    startDate: "2025-12-12",
    endDate: "2025-12-18",
    car: {
      brand: "VW",
      model: "Polo",
      plate: "WA 55221",
      images: ["https://picsum.photos/seed/car_b3_1/900/600"],
    },
    rating: 5,
  },
  {
    id: "b4",
    status: "history",
    startDate: "2025-11-01",
    endDate: "2025-11-04",
    flat: {
      address: "Baker Street 221B",
      images: [],
    },
    rating: 4,
  },
];

export default function HomeTab() {
  const router = useRouter();
  const [selected, setSelected] = useState<BookingStatus>("current");

  const bookings = useMemo(
    () => MOCK_BOOKINGS.filter((b) => b.status === selected),
    [selected]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>

        <Pressable style={styles.profileButton} onPress={() => {}}>
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
            <Text style={[styles.segmentText, selected === "current" && styles.segmentTextActive]}>
              current
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, selected === "history" && styles.segmentBtnActive]}
            onPress={() => setSelected("history")}
          >
            <Text style={[styles.segmentText, selected === "history" && styles.segmentTextActive]}>
              history
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onSeeMore={() => router.push(`../booking/${b.id}`)}
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

function BookingCard({ booking, onSeeMore }: { booking: Booking; onSeeMore: () => void }) {
  return (
    <View style={styles.card}>
      {booking.car && booking.flat ? (
        <>
          <CarCardView
            title={`${booking.car.brand} ${booking.car.model}`}
            subtitle={`Plate: ${booking.car.plate}`}
            images={booking.car.images}
            fallbackSource={require("../../assets/images/no-images.png")}
            metaLeft={"🚗 Car"}
            metaRight={""}
            imageHeight={200}
          />

          <View style={styles.sectionDivider} />

          <CarCardView
            title={booking.flat.address}
            subtitle={"Flat"}
            images={booking.flat.images}
            fallbackSource={require("../../assets/images/no-images.png")}
            metaLeft={"🏠 Flat"}
            metaRight={""}
            imageHeight={200}
          />
        </>
      ) : booking.car ? (
        <CarCardView
          title={`${booking.car.brand} ${booking.car.model}`}
          subtitle={`Plate: ${booking.car.plate}`}
          images={booking.car.images}
          fallbackSource={require("../../assets/images/no-images.png")}
          metaLeft={"🚗 Car"}
          metaRight={""}
          imageHeight={200}
        />
      ) : booking.flat ? (
        <CarCardView
          title={booking.flat.address}
          subtitle={"Flat"}
          images={booking.flat.images}
          fallbackSource={require("../../assets/images/no-images.png")}
          metaLeft={"🏠 Flat"}
          metaRight={""}
          imageHeight={200}
        />
      ) : null}

      <View style={styles.bottomInfo}>
        <View style={styles.bottomRow}>
          <Text style={styles.metaText}>
            {booking.startDate} - {booking.endDate}
          </Text>

          {booking.status === "history" && typeof booking.rating === "number" ? (
            <Stars value={booking.rating} />
          ) : null}
        </View>

        <View style={styles.cardActions}>
          <Pressable onPress={onSeeMore}>
            <Text style={styles.linkText}>see more</Text>
          </Pressable>

          {booking.status === "current" ? (
            <Pressable style={styles.cancelBtn} onPress={() => {}}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function Stars({ value }: { value: number }) {
  const n = Math.max(0, Math.min(5, Math.floor(value)));
  const out = "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
  return <Text style={styles.stars}>{out}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },

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
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  profileButtonText: { color: "#fff", fontWeight: "800" },

  segmentWrap: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  sectionLabel: { color: "#6B7280", fontWeight: "700" },
  segment: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  segmentBtnActive: { backgroundColor: "#111827" },
  segmentText: { fontWeight: "800", color: "#111827" },
  segmentTextActive: { color: "#fff" },

  body: { flex: 1, paddingHorizontal: 16 },
  list: { paddingBottom: 16, gap: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 2,
  },

  bottomInfo: { gap: 10 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaText: { color: "#6B7280", fontWeight: "700" },
  stars: { fontWeight: "900", color: "#111827" },

  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  linkText: { fontWeight: "900", color: "#111827" },

  cancelBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  cancelBtnText: { fontWeight: "900", color: "#991B1B" },

  emptyWrap: { paddingVertical: 24, alignItems: "center" },
  mutedText: { color: "#6B7280", fontWeight: "700" },
});
