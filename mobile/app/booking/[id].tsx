import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

// For now: duplicate mock data or later replace with backend call.
// If you prefer, you can export MOCK_BOOKINGS from HomeTab and import it here.
const MOCK_BOOKINGS = [
  { id: "b1", status: "current", startDate: "2026-02-01", endDate: "2026-02-10" },
  { id: "b2", status: "current", startDate: "2026-03-03", endDate: "2026-03-07" },
  { id: "b3", status: "history", startDate: "2025-12-12", endDate: "2025-12-18" },
  { id: "b4", status: "history", startDate: "2025-11-01", endDate: "2025-11-04" },
];

export default function BookingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const booking = useMemo(
    () => MOCK_BOOKINGS.find((b) => b.id === id),
    [id]
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Booking details</Text>

      {booking ? (
        <View style={styles.card}>
          <Text style={styles.line}>id: {booking.id}</Text>
          <Text style={styles.line}>status: {booking.status}</Text>
          <Text style={styles.line}>
            dates: {booking.startDate} - {booking.endDate}
          </Text>

          <Text style={styles.hint}>
            (Later: show car/flat info, images carousel, cancel/rating actions.)
          </Text>
        </View>
      ) : (
        <Text style={styles.notFound}>Booking not found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    backgroundColor: "#F9FAFB",
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
    borderColor: "#E5E7EB",
  },
  backText: {
    fontWeight: "700",
    color: "#111827",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  line: {
    fontWeight: "600",
    color: "#111827",
  },
  hint: {
    color: "#6B7280",
    marginTop: 8,
  },
  notFound: {
    color: "#6B7280",
    fontWeight: "700",
  },
});
