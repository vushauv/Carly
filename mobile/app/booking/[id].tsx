import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getBookingById, type Booking } from "../../lib/bookingsStorage";

export default function BookingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const b = await getBookingById(id);
      setBooking(b);
    })();
  }, [id]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Booking details</Text>

        {booking ? (
          <View style={styles.card}>
            <Text style={styles.line}>id: {booking.id}</Text>
            <Text style={styles.line}>list: {booking.status}</Text>
            <Text style={styles.line}>state: {booking.state}</Text>
            <Text style={styles.line}>
              dates: {booking.startDate} - {booking.endDate}
            </Text>

            {booking.cancelledAtISO ? (
              <Text style={styles.hint}>cancelled at: {booking.cancelledAtISO}</Text>
            ) : null}
          </View>
        ) : (
          <Text style={styles.notFound}>Booking not found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 16,
    backgroundColor: "#FFFBEB",
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
  backText: {
    fontWeight: "900",
    color: "#111827",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  line: {
    fontWeight: "800",
    color: "#111827",
  },
  hint: {
    color: "#6B7280",
    marginTop: 8,
    fontWeight: "800",
  },
  notFound: {
    color: "#6B7280",
    fontWeight: "800",
  },
});

