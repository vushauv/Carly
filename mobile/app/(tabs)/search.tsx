//mobile/app/(tabs)/search.tsx

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";


import type { CarCard, CarColor, CarSearchFilters, FuelType } from "../../lib/models";
import { dislikeCar, getSearchLookups, likeCar, searchCars } from "../../lib/api/carlyApi";
import { addDislikedCarId, addLikedCar, getDislikedCarIds, getLikedCarIds } from "../../lib/storage/storage";
import { saveCarDetailsForId } from "../../lib/storage/viewedCarsStorage";
import CarCardView from "../components/CarCardView";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DEFAULT_FILTERS: CarSearchFilters = {
  priceRange: { min: 0, max: 500 },
};

export default function SearchTab() {
  const router = useRouter();

  const [filters, setFilters] = useState<CarSearchFilters>(DEFAULT_FILTERS);
  const [cars, setCars] = useState<CarCard[]>([]);
  const [index, setIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [locked, setLocked] = useState(false);

  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [dislikedSet, setDislikedSet] = useState<Set<string>>(new Set());

  const [brands, setBrands] = useState<string[]>([]);
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, string[]>>({});
  const [colors, setColors] = useState<CarColor[]>([]);

  const toastTextRef = useRef<string>("");
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const currentCar = useMemo(() => cars[index] ?? null, [cars, index]);
  const nextCar = useMemo(() => cars[index + 1] ?? null, [cars, index]);

  function showToast(text: string) {
    toastTextRef.current = text;
    toastOpacity.stopAnimation();
    toastOpacity.setValue(0);

    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 140, useNativeDriver: true }),
      Animated.delay(450),
      Animated.timing(toastOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }

  function filterOutSeen(list: CarCard[], liked: Set<string>, disliked: Set<string>) {
    return list.filter((c) => !liked.has(c.id) && !disliked.has(c.id));
  }

  async function hydratePrefs() {
    const [likedIds, dislikedIds] = await Promise.all([getLikedCarIds(), getDislikedCarIds()]);
    setLikedSet(likedIds);
    setDislikedSet(dislikedIds);
  }
    useFocusEffect(
      useCallback(() => {
        hydratePrefs();
      }, [])
    );

  async function hydrateLookups() {
    const l = await getSearchLookups();
    setBrands(l.brands);
    setModelsByBrand(l.modelsByBrand);
    setColors(l.colors);
  }

  async function loadCars(nextFilters: CarSearchFilters, nextPage: number, mode: "replace" | "append") {
    if (mode === "replace") setLoading(true);
    else setPrefetching(true);

    setError(null);

    try {
      const res = await searchCars({ ...(nextFilters as any), __page: nextPage });

      setCars((prev) => {
        // when user changes filters (mode === "replace"), show matches even if seen before.
        // Otherwise you can easily end up with "No more cars" while backend returned data.
        const incoming =
          mode === "replace"
            ? res
            : filterOutSeen(res, likedSet, dislikedSet);

        if (__DEV__) {
          console.log(
            `[CARS][UI] mode=${mode} page=${nextPage} backend=${res.length} incoming=${incoming.length} liked=${likedSet.size} disliked=${dislikedSet.size}`
          );
        }

        return mode === "replace" ? incoming : [...prev, ...incoming];
      });

      if (mode === "replace") setIndex(0);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load cars.");
      if (mode === "replace") setCars([]);
    } finally {
      setLoading(false);
      setPrefetching(false);
    }
  }


  useEffect(() => {
    (async () => {
      await Promise.all([hydratePrefs(), hydrateLookups()]);
      await loadCars(filters, page, "replace");
    })();
  }, []);

  async function onApplyFilters(next: CarSearchFilters) {
    setFilters(next);
    setFiltersOpen(false);
    setPage(0);
    await loadCars(next, 0, "replace");
  }

  async function maybePrefetchMore(nextIndex: number) {
    const remaining = cars.length - nextIndex;
    if (prefetching || loading) return;
    if (remaining >= 3) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await loadCars(filters, nextPage, "append");
  }

  async function handleAction(action: "dislike" | "like") {
    if (!currentCar || locked) return;

    setLocked(true);
    const car = currentCar;
    const carId = car.id;

    showToast(action === "like" ? "Saved to Liked ✅" : "Skipped ❌");

    try {
      if (action === "like") {
        await addLikedCar(car);
        setLikedSet((prev) => new Set(prev).add(carId));
        await likeCar(carId);
      } else {
        await addDislikedCarId(carId);
        setDislikedSet((prev) => new Set(prev).add(carId));
        await dislikeCar(carId);
      }
    } finally {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setLocked(false);
      void maybePrefetchMore(nextIndex);
    }
  }

  async function onSeeMore(car: CarCard) {
    // Save the object so the details screen can render even without backend.
    await saveCarDetailsForId(car);
    router.push(`/car/${car.id}`);
  }

  const chips = useMemo(() => {
    const out: string[] = [];
    if (filters.fuelType) out.push(`⛽ ${filters.fuelType}`);
    if (filters.brand) out.push(`🏷️ ${filters.brand}`);
    if (filters.model) out.push(`🔎 ${filters.model}`);
    if (filters.color) out.push(`🎨 ${filters.color}`);
    out.push(`💰 ${filters.priceRange.min.toFixed(2)}–${filters.priceRange.max.toFixed(2)}`);
    return out;
  }, [filters]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={styles.likedPill}>
            <Text style={styles.likedPillText}>Liked: {likedSet.size}</Text>
          </View>

          <Pressable style={styles.filtersButton} onPress={() => setFiltersOpen(true)}>
            <Text style={styles.filtersButtonText}>Filters</Text>
          </Pressable>
        </View>
      </View>

      {/* Chips */}
      <View style={styles.chipsRow}>
        {chips.map((c) => (
          <Chip key={c} label={c} />
        ))}
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.mutedText}>Loading cars…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => loadCars(filters, page, "replace")}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : !currentCar ? (
          <View style={styles.center}>
            <Text style={styles.mutedText}>No more cars.</Text>
            <Text style={styles.mutedTextSmall}>Change filters or refresh.</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable style={styles.retryBtn} onPress={() => setFiltersOpen(true)}>
                <Text style={styles.retryText}>Open filters</Text>
              </Pressable>
              <Pressable style={styles.retryBtn} onPress={() => loadCars(filters, page, "replace")}>
                <Text style={styles.retryText}>Refresh</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {/* Deck (static; only buttons advance) */}
            <View style={styles.deck}>
              {nextCar ? (
                <View style={[styles.card, styles.cardBehind]}>
                  <CarCardContent car={nextCar} onSeeMore={onSeeMore} />
                </View>
              ) : null}

              <View style={[styles.card, styles.cardFront]}>
                <CarCardContent car={currentCar} onSeeMore={onSeeMore} />
              </View>
            </View>

            {/* Toast near buttons */}
            <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toastOpacity }]}>
              <View style={styles.toastTextWrap}>
                <Text style={styles.toastText}>{toastTextRef.current}</Text>
              </View>
            </Animated.View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <ActionButton variant="dislike" disabled={locked} onPress={() => void handleAction("dislike")} />
              <ActionButton variant="like" disabled={locked} onPress={() => void handleAction("like")} />
            </View>

            {prefetching ? <Text style={styles.prefetchText}>Loading more…</Text> : null}
          </>
        )}
      </View>

      {/* Filters modal */}
      <FiltersModal
        open={filtersOpen}
        initial={filters}
        brands={brands}
        modelsByBrand={modelsByBrand}
        colors={colors}
        onClose={() => {
          Keyboard.dismiss();
          setFiltersOpen(false);
        }}
        onApply={onApplyFilters}
      />
    </SafeAreaView>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function CarCardContent({ car, onSeeMore }: { car: CarCard; onSeeMore: (c: CarCard) => void }) {
  const images = useMemo(() => {
    //  Use backend images (variable length)
    if (Array.isArray(car.imageUrls) && car.imageUrls.length > 0) return car.imageUrls;

    // Safety fallback: exactly ONE random image
    return [car.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(car.id + "_" + Date.now())}/900/600`];
  }, [car.id, car.imageUrl, car.imageUrls]);

  return (
    <CarCardView
      title={car.title}
      subtitle={car.subtitle}
      images={images}
      metaLeft={`⛽ ${car.fuelType}`}
      metaRight={`🎨 ${car.color}`}
      footerLeft={`${car.pricePerDay} ${car.currency} / day`}
      footerRight={
        <Pressable onPress={() => onSeeMore(car)} style={styles.seeMoreBtn}>
          <Text style={styles.seeMoreText}>see more</Text>
        </Pressable>
      }
      imageHeight={200}
    />
  );
}


function ActionButton({
  variant,
  disabled,
  onPress,
}: {
  variant: "like" | "dislike";
  disabled?: boolean;
  onPress: () => void;
}) {
  const label = variant === "like" ? "❤️ Like" : "✖️ Nope";
  return (
    <Pressable
      disabled={disabled}
      style={[
        styles.actionBtn,
        variant === "like" ? styles.likeBtn : styles.dislikeBtn,
        disabled && styles.actionBtnDisabled,
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

function FiltersModal({
  open,
  initial,
  brands,
  modelsByBrand,
  colors,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: CarSearchFilters;
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  colors: CarColor[];
  onClose: () => void;
  onApply: (filters: CarSearchFilters) => void;
}) {
  const [draft, setDraft] = useState<CarSearchFilters>(initial);

  // string inputs for price so user can type normally
  const [minText, setMinText] = useState<string>(String(initial.priceRange.min));
  const [maxText, setMaxText] = useState<string>(String(initial.priceRange.max));

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setMinText(String(initial.priceRange.min));
      setMaxText(String(initial.priceRange.max));
    }
  }, [open, initial]);

  function set<K extends keyof CarSearchFilters>(key: K, value: CarSearchFilters[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
  }

  const modelOptions = modelsByBrand["*"] ?? [];
  const fuelOptions: (FuelType | "")[] = ["", "gas", "diesel", "electric", "hybrid"];

  function sanitizePriceText(v: string) {
    // allow digits, comma, dot
    return v.replace(/[^\d.,]/g, "");
  }

  function parsePrice(v: string, fallback: number) {
    const n = Number(sanitizePriceText(v).replace(",", "."));
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizePriceTexts() {
    const min = parsePrice(minText, draft.priceRange.min ?? 0);
    const max = parsePrice(maxText, draft.priceRange.max ?? 500);
    setMinText(String(min));
    setMaxText(String(max));
    set("priceRange", { min, max } as any);
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.modalClose}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            <Text style={styles.fieldLabel}>Fuel type</Text>
            <View style={styles.optionRow}>
              {fuelOptions.map((opt) => {
                const active = (draft.fuelType ?? "") === opt;
                return (
                  <Pressable
                    key={opt || "any"}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => set("fuelType", (opt || undefined) as any)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {opt ? opt : "any"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Brand</Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[styles.option, !draft.brand && styles.optionActive]}
                onPress={() => {
                  set("brand", undefined);
                  set("model", undefined);
                }}
              >
                <Text style={[styles.optionText, !draft.brand && styles.optionTextActive]}>any</Text>
              </Pressable>

              {brands.map((b) => {
                const active = draft.brand === b;
                return (
                  <Pressable
                    key={b}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      set("brand", b);
                      set("model", undefined);
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{b}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Model</Text>
            <View style={styles.optionRow}>
              <Pressable style={[styles.option, !draft.model && styles.optionActive]} onPress={() => set("model", undefined)}>
                <Text style={[styles.optionText, !draft.model && styles.optionTextActive]}>any</Text>
              </Pressable>

              {modelOptions.length === 0 ? (
                <Text style={styles.helperText}>No models available.</Text>
              ) : (
                modelOptions.map((m) => {
                  const active = draft.model === m;
                  return (
                    <Pressable
                      key={m}
                      style={[styles.option, active && styles.optionActive]}
                      onPress={() => set("model", m)}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>{m}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.optionRow}>
              <Pressable style={[styles.option, !draft.color && styles.optionActive]} onPress={() => set("color", undefined)}>
                <Text style={[styles.optionText, !draft.color && styles.optionTextActive]}>any</Text>
              </Pressable>

              {colors.map((c) => {
                const active = draft.color === c;
                return (
                  <Pressable
                    key={c}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => set("color", c)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Price per day</Text>
            <View style={styles.priceInputsRow}>
              <TextInput
                value={minText}
                onChangeText={(v) => setMinText(sanitizePriceText(v))}
                onBlur={normalizePriceTexts}
                placeholder="0"
                keyboardType="decimal-pad"
                style={[styles.input, styles.priceInput]}
              />
              <TextInput
                value={maxText}
                onChangeText={(v) => setMaxText(sanitizePriceText(v))}
                onBlur={normalizePriceTexts}
                placeholder="500"
                keyboardType="decimal-pad"
                style={[styles.input, styles.priceInput]}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => {
                  setDraft(DEFAULT_FILTERS);
                  setMinText(String(DEFAULT_FILTERS.priceRange.min));
                  setMaxText(String(DEFAULT_FILTERS.priceRange.max));
                }}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextGhost]}>Reset</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => {
                  const minN = parsePrice(minText, DEFAULT_FILTERS.priceRange.min);
                  const maxN = parsePrice(maxText, DEFAULT_FILTERS.priceRange.max);

                  const min = Math.min(minN, maxN);
                  const max = Math.max(minN, maxN);

                  onApply({ ...draft, priceRange: { min, max } });
                }}
              >
                <Text style={styles.modalBtnText}>Apply</Text>
              </Pressable>
            </View>

            <View style={{ height: 180 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFBEB" },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#111827" },

  likedPill: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  likedPillText: { color: "#111827", fontSize: 12, fontWeight: "900" },

  filtersButton: {
    backgroundColor: "#FACC15",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  filtersButtonText: { color: "#111827", fontWeight: "900" },

  chipsRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  chip: {
    backgroundColor: "#FEF3C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  chipText: { color: "#111827", fontSize: 12, fontWeight: "800" },

  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 12 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  mutedText: { color: "#6B7280", fontWeight: "700" },
  mutedTextSmall: { color: "#9CA3AF", fontWeight: "700" },
  errorText: { color: "#B91C1C", fontWeight: "900" },
  retryBtn: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "900" },

  deck: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: { width: "100%" },
  cardBehind: { position: "absolute", top: 12, transform: [{ scale: 0.98 }], opacity: 0.9 },
  cardFront: { position: "absolute", top: 0 },

  toast: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 110,
    alignItems: "center",
    zIndex: 50,
  },
  toastTextWrap: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  toastText: { color: "#fff", fontWeight: "900" },

  actionsRow: { marginTop: 12, flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontWeight: "900", fontSize: 16 },
  dislikeBtn: { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" },
  likeBtn: { backgroundColor: "#FACC15", borderColor: "#F59E0B" },

  prefetchText: {
    textAlign: "center",
    marginTop: 10,
    color: "#6B7280",
    fontWeight: "800",
  },

  seeMoreBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
    borderWidth: 1,
    borderColor: "#93C5FD",
  },
  seeMoreText: { fontWeight: "900", color: "#1D4ED8" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "82%",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  modalClose: { fontWeight: "900", color: "#2563EB" },

  fieldLabel: { marginTop: 14, marginBottom: 6, color: "#111827", fontWeight: "900" },
  helperText: { marginTop: 8, color: "#6B7280", fontWeight: "700" },

  input: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    color: "#111827",
    fontWeight: "700",
  },

  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  option: {
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFFBEB",
  },
  optionActive: { backgroundColor: "#FACC15", borderColor: "#F59E0B" },
  optionText: { color: "#111827", fontWeight: "900" },
  optionTextActive: { color: "#111827" },

  priceInputsRow: { flexDirection: "row", gap: 10 },
  priceInput: { flex: 1 },

  modalActions: { marginTop: 18, flexDirection: "row", gap: 10 },
  modalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1 },
  modalBtnPrimary: { backgroundColor: "#FACC15", borderColor: "#F59E0B" },
  modalBtnGhost: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
  modalBtnText: { fontWeight: "900", color: "#111827" },
  modalBtnTextGhost: { color: "#111827" },
});


