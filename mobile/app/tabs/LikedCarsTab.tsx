import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { LikedCar } from "../../lib/storage";
import { clearLikedCars, getLikedCars, removeLikedCar } from "../../lib/storage";

export default function LikedCarsTab() {
  const [liked, setLiked] = useState<LikedCar[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const items = await getLikedCars();
    setLiked(items);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  async function onRemove(id: string) {
    await removeLikedCar(id);
    await load();
  }

  async function onClearAll() {
    await clearLikedCars();
    await load();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Liked</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{liked.length}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {liked.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No liked cars yet.</Text>
            <Text style={styles.emptySub}>Go to Search and tap ❤️ Like.</Text>
          </View>
        ) : (
          <>
            <Pressable style={styles.clearBtn} onPress={onClearAll}>
              <Text style={styles.clearBtnText}>Clear all</Text>
            </Pressable>

            {liked.map((car) => (
              <View key={car.id} style={styles.card}>
                <Image
                  source={{ uri: car.imageUrl || "https://picsum.photos/900/600" }}
                  style={styles.image}
                />

                <View style={styles.body}>
                  <Text style={styles.carTitle}>{car.title}</Text>
                  {car.subtitle ? <Text style={styles.subtitle}>{car.subtitle}</Text> : null}

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>⛽ {car.fuelType}</Text>
                    <Text style={styles.metaText}>🎨 {car.color}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <Text style={styles.price}>
                      {car.pricePerDay} {car.currency} / day
                    </Text>

                    <Pressable style={styles.removeBtn} onPress={() => onRemove(car.id)}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },

  countPill: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: { color: "#fff", fontWeight: "900" },

  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },

  empty: { marginTop: 80, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  emptySub: { color: "#6B7280", fontWeight: "600", textAlign: "center" },

  clearBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearBtnText: { fontWeight: "900", color: "#111827" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  image: { width: "100%", height: 180, backgroundColor: "#E5E7EB" },
  body: { padding: 14 },

  carTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6B7280", fontWeight: "600" },

  metaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  metaText: { color: "#111827", fontWeight: "800" },

  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { fontSize: 16, fontWeight: "900", color: "#111827" },

  removeBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  removeBtnText: { fontWeight: "900", color: "#991B1B" },
});
