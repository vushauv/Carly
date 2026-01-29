import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";

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
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  car?: Car;
  flat?: Flat;
  rating?: number; // 1..5 (history only)
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
      images: ["https://picsum.photos/400/250", "https://picsum.photos/401/250"],
    },
    flat: {
      address: "Sesame Street 123",
      images: [],
    },
  },
  {
    id: "b2",
    status: "current",
    startDate: "2026-03-03",
    endDate: "2026-03-07",
    car: { brand: "BMW", model: "X1", plate: "WX 99887", images: [] },
    flat: { address: "Sesame Street 123", images: ["https://picsum.photos/400/250"] },
  },
  {
    id: "b3",
    status: "history",
    startDate: "2025-12-12",
    endDate: "2025-12-18",
    car: { brand: "VW", model: "Polo", plate: "WA 55221", images: [] },
    rating: 5,
  },
  {
    id: "b4",
    status: "history",
    startDate: "2025-11-01",
    endDate: "2025-11-04",
    flat: { address: "Baker Street 221B", images: [] },
    rating: 4,
  },
];

export default function HomeTab() {
  const [selected, setSelected] = useState<BookingStatus>("current");

  const bookings = useMemo(
    () => MOCK_BOOKINGS.filter((b) => b.status === selected),
    [selected]
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.username}>username</Text>

        <Pressable style={styles.profileButton} onPress={() => { }}>
          <Text style={styles.profileButtonText}>Profile settings</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>View bookings:</Text>

        <View style={styles.segment}>
          <Pressable
            style={[
              styles.segmentBtn,
              selected === "current" && styles.segmentBtnActive,
            ]}
            onPress={() => setSelected("current")}
          >
            <Text
              style={[
                styles.segmentText,
                selected === "current" && styles.segmentTextActive,
              ]}
            >
              current
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentBtn,
              selected === "history" && styles.segmentBtnActive,
            ]}
            onPress={() => setSelected("history")}
          >
            <Text
              style={[
                styles.segmentText,
                selected === "history" && styles.segmentTextActive,
              ]}
            >
              history
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onCancel={() => { }}
            onSeeMore={() => { }}
          />
        ))}

        {bookings.length === 0 && (
          <Text style={styles.emptyText}>No bookings to show.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function BookingCard({
  booking,
  onCancel,
  onSeeMore,
}: {
  booking: Booking;
  onCancel: () => void;
  onSeeMore: () => void;
}) {
  const title =
    booking.car && booking.flat
      ? "Car + Flat"
      : booking.car
        ? "Car"
        : booking.flat
          ? "Flat"
          : "Booking";

  const previewImages =
    booking.car?.images?.length ? booking.car.images :
      booking.flat?.images?.length ? booking.flat.images :
        [];


  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        {booking.status === "history" && typeof booking.rating === "number" ? (
          <Stars value={booking.rating} />
        ) : null}
      </View>

      <View style={styles.previewBox}>
        {previewImages.length > 0 ? (
          <Image
            source={{ uri: previewImages[0] }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require("../../assets/images/no-images.png")}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}
      </View>


      <Text style={styles.pageIndicator}>1/8</Text>

      {booking.car ? (
        <Text style={styles.metaText}>
          brand: {booking.car.brand} • {booking.car.model} • {booking.car.plate}
        </Text>
      ) : null}

      {booking.flat ? (
        <Text style={styles.metaText}>address: {booking.flat.address}</Text>
      ) : null}

      <Text style={styles.metaText}>
        {booking.startDate} - {booking.endDate}
      </Text>

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
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.floor(value)));
  const stars = "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full); // simple 5-star string
  return <Text style={styles.stars}>{stars}</Text>;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    gap: 10,
    paddingBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  profileButton: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileButtonText: {
    fontWeight: "600",
    color: "#111827",
  },
  sectionLabel: {
    textAlign: "center",
    color: "#4B5563",
    fontWeight: "500",
  },
  segment: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  segmentBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  segmentBtnActive: {
    backgroundColor: "#F2C94C",
  },
  segmentText: {
    color: "#111827",
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#111827",
  },
  list: {
    paddingBottom: 18,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  previewBox: {
    borderWidth: 2,
    borderColor: "#F2C94C",
    borderRadius: 16,
    paddingVertical: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  previewText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  pageIndicator: {
    textAlign: "center",
    color: "#F2C94C",
    fontWeight: "700",
  },
  metaText: {
    color: "#374151",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  linkText: {
    color: "#6B7280",
    textDecorationLine: "underline",
  },
  cancelBtn: {
    backgroundColor: "#FAD7D7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontWeight: "700",
    color: "#111827",
  },
  stars: {
    color: "#F2C94C",
    fontWeight: "800",
    letterSpacing: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },
  previewImage: {
  width: "100%",
  height: 140,
  borderRadius: 12,
},

});
