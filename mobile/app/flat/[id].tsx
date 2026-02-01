//app/flat/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import CarCardView from "../components/CarCardView";
import { getFlatDetails } from "../../lib/flatlyApi";

type FlatUi = {
  id: number;
  title: string;
  address: string;
  city: string;
  rooms?: number;
  beds?: number;
  bathrooms?: number;
  areaSqm?: number;
  maxGuests?: number;
  images: string[];
};

function placeholder(seed: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/600`;
}

export default function FlatDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [flat, setFlat] = useState<FlatUi | null>(null);

  useEffect(() => {
    (async () => {
      const n = Number(id);
      if (!Number.isFinite(n)) return;

      const dto = await getFlatDetails(n);

      const urls =
        Array.isArray(dto.images)
          ? dto.images
              .map((x) => String(x?.image_url ?? "").trim())
              .filter((u) => u.length > 0)
          : [];

      setFlat({
        id: dto.id,
        title: (dto.name ?? "Flat").trim() || "Flat",
        address: (dto.address_line ?? dto.location ?? "—").trim() || "—",
        city: (dto.city ?? "—").trim() || "—",
        rooms: dto.rooms,
        beds: dto.beds,
        bathrooms: dto.bathrooms,
        areaSqm: dto.area_sqm,
        maxGuests: dto.max_guests,
        images: urls.length ? urls : [placeholder(`flat_${dto.id}`)],
      });
    })();
  }, [id]);

  const subtitle = useMemo(() => {
    if (!flat) return "";
    return `${flat.address}, ${flat.city}`;
  }, [flat]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Flat details</Text>

        {!flat ? (
          <Text style={styles.muted}>Flat not found.</Text>
        ) : (
          <>
            <CarCardView
              title={flat.title}
              subtitle={subtitle}
              images={flat.images}
              metaLeft={"🏠 Flat"}
              metaRight={flat.maxGuests ? `👤 up to ${flat.maxGuests}` : ""}
              imageHeight={240}
            />

            <View style={styles.infoCard}>
              <Text style={styles.line}>Address: {flat.address}</Text>
              <Text style={styles.line}>City: {flat.city}</Text>
              <Text style={styles.line}>Rooms: {flat.rooms ?? "—"}</Text>
              <Text style={styles.line}>Beds: {flat.beds ?? "—"}</Text>
              <Text style={styles.line}>Bathrooms: {flat.bathrooms ?? "—"}</Text>
              <Text style={styles.line}>Area: {typeof flat.areaSqm === "number" ? `${flat.areaSqm} m²` : "—"}</Text>
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
