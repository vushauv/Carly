// app/tabs/HomeTab.tsx
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [selected, setSelected] = useState<BookingStatus>("current");

  const bookings = useMemo(
    () => MOCK_BOOKINGS.filter((b) => b.status === selected),
    [selected]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header (same style vibe as SearchTab) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>

        <Pressable style={styles.profileButton} onPress={() => { }}>
          <Text style={styles.profileButtonText}>Profile settings</Text>
        </Pressable>
      </View>

      {/* Segmented (Current / History) */}
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

      {/* List */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} />
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

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <View style={styles.card}>
      {/* If BOTH exist: Car section + divider + Flat section */}
      {booking.car && booking.flat ? (
        <>
          <BookingSection
            title="Car"
            images={booking.car.images}
            metaLines={[
              `brand: ${booking.car.brand} • ${booking.car.model} • ${booking.car.plate}`,
            ]}
          />

          <View style={styles.sectionDivider} />

          <BookingSection
            title="Flat"
            images={booking.flat.images}
            metaLines={[`address: ${booking.flat.address}`]}
          />
        </>
      ) : booking.car ? (
        <BookingSection
          title="Car"
          images={booking.car.images}
          metaLines={[
            `brand: ${booking.car.brand} • ${booking.car.model} • ${booking.car.plate}`,
          ]}
        />
      ) : booking.flat ? (
        <BookingSection
          title="Flat"
          images={booking.flat.images}
          metaLines={[`address: ${booking.flat.address}`]}
        />
      ) : null}

      {/* Booking-level info (dates + rating + actions) */}
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
          <Pressable onPress={() => {}}>
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

function BookingSection({
  title,
  images,
  metaLines,
}: {
  title: "Car" | "Flat";
  images: string[]; // 0..2
  metaLines: string[];
}) {
  const [previewWidth, setPreviewWidth] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  const hasRemoteImages = images.length > 0;
  const slidesCount = hasRemoteImages ? images.length : 1;

  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View
        style={styles.previewWrap}
        onLayout={(e) => setPreviewWidth(e.nativeEvent.layout.width)}
      >
        {hasRemoteImages ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              const w = e.nativeEvent.layoutMeasurement.width || 1;
              const next = Math.round(x / w);
              if (next !== imgIndex) setImgIndex(next);
            }}
            scrollEventThrottle={16}
          >
            {images.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={[styles.previewImage, { width: previewWidth || 1 }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : (
          <Image
            source={require("../../assets/images/no-images.png")}
            style={[styles.previewImage, { width: previewWidth || 1 }]}
            resizeMode="contain"
          />
        )}

        {slidesCount > 1 ? (
          <View style={styles.dotsRow}>
            {Array.from({ length: slidesCount }).map((_, i) => (
              <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
            ))}
          </View>
        ) : null}
      </View>

      <Text style={styles.pageIndicator}>
        {imgIndex + 1}/{slidesCount}
      </Text>

      {metaLines.map((line) => (
        <Text key={line} style={styles.metaText}>
          {line}
        </Text>
      ))}
    </View>
  );
}



function Stars({ value }: { value: number }) {
  const n = Math.max(0, Math.min(5, Math.floor(value)));
  const out = "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
  return <Text style={styles.stars}>{out}</Text>;
}

const styles = StyleSheet.create({
  /* ---------- Screen ---------- */
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  body: {
    flex: 1,
    paddingHorizontal: 16,
  },

  list: {
    paddingBottom: 20,
    gap: 14,
  },

  /* ---------- Header ---------- */
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  profileButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  profileButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  /* ---------- Segmented control ---------- */
  segmentWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  sectionLabel: {
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },
  segment: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  segmentBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  segmentBtnActive: {
    backgroundColor: "#FEF9C3",
  },
  segmentText: {
    fontWeight: "700",
    color: "#111827",
  },
  segmentTextActive: {
    color: "#111827",
  },

  /* ---------- Booking card ---------- */
  card: {
    backgroundColor: "#FFFFFF",
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

  /* ---------- Sections (Car / Flat) ---------- */
  sectionWrap: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  /* ---------- Image preview ---------- */
  previewWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  previewImage: {
    height: 210,
    backgroundColor: "#ffffff",
  },

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
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },

  pageIndicator: {
    textAlign: "center",
    color: "#F2C94C",
    fontWeight: "800",
  },

  /* ---------- Meta ---------- */
  metaText: {
    color: "#111827",
    fontWeight: "600",
  },

  /* ---------- Bottom area ---------- */
  bottomInfo: {
    gap: 10,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkText: {
    color: "#6B7280",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  cancelBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  cancelBtnText: {
    fontWeight: "800",
    color: "#111827",
  },

  /* ---------- Rating ---------- */
  stars: {
    color: "#F2C94C",
    fontWeight: "900",
    letterSpacing: 1,
  },

  /* ---------- Empty state ---------- */
  emptyWrap: {
    paddingTop: 40,
    alignItems: "center",
  },
  mutedText: {
    color: "#6B7280",
    fontWeight: "600",
  },
});



