//app/car/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import CarCardView from "../../app/components/CarCardView";
import { getCarDetailsForId } from "../../lib/viewedCarsStorage";
import type { CarCard } from "../../lib/models";

export default function CarDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [car, setCar] = useState<CarCard | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const c = await getCarDetailsForId(id);
      setCar(c);
    })();
  }, [id]);

  const images = useMemo(() => {
    if (!car) return [];

    // ✅ Use backend-provided images if present
    if (Array.isArray(car.imageUrls) && car.imageUrls.length > 0) return car.imageUrls;

    // ✅ Fallback: exactly one placeholder
    return [car.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(car.id + "_" + Date.now())}/900/600`];
  }, [car]);


  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Car details</Text>

        {!car ? (
          <Text style={styles.muted}>Car not found (open it again from Search).</Text>
        ) : (
          <>
            <CarCardView
              title={car.title}
              subtitle={car.subtitle}
              images={images}
              metaLeft={`⛽ ${car.fuelType}`}
              metaRight={`🎨 ${car.color}`}
              footerLeft={`${car.pricePerDay} ${car.currency} / day`}
              imageHeight={240}
            />

            <View style={styles.infoCard}>
              <Text style={styles.line}>Brand: {car.brand}</Text>
              <Text style={styles.line}>Model: {car.model}</Text>
              <Text style={styles.line}>Fuel: {car.fuelType}</Text>
              <Text style={styles.line}>Color: {car.color}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },
  page: { padding: 16, gap: 12 },
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
  muted: { color: "#6B7280", fontWeight: "800" },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 6,
  },
  line: { fontWeight: "800", color: "#111827" },
});

