// app/tabs/SearchTab.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { CarCard, CarColor, CarSearchFilters, FuelType } from "../../lib/models";
import { dislikeCar, getSearchLookups, likeCar, searchCars } from "../../lib/carlyApi";
import { addDislikedCarId, addLikedCar, getDislikedCarIds, getLikedCarIds } from "../../lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DISTANCE = SCREEN_WIDTH * 1.2;

const DEFAULT_FILTERS: CarSearchFilters = {
  priceRange: { min: 0, max: 500 },
};

export default function SearchTab() {
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

  // Smooth toast (no flicker)
  const toastTextRef = useRef<string>("");
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Card animation
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Prevent card-swipe gesture while user is swiping image carousel
  const carouselActiveRef = useRef(false);

  const currentCar = useMemo(() => cars[index] ?? null, [cars, index]);
  const nextCar = useMemo(() => cars[index + 1] ?? null, [cars, index]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });


  const cardStyle = {
    transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
  };

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
        const incoming = filterOutSeen(res, likedSet, dislikedSet);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function resetPosition() {
    position.setValue({ x: 0, y: 0 });
  }

  function animateSwipeOut(direction: "left" | "right", onDone: () => void) {
    const toX = direction === "right" ? SWIPE_OUT_DISTANCE : -SWIPE_OUT_DISTANCE;

    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onDone();
      resetPosition();
    });
  }

  async function commitSwipe(direction: "left" | "right") {
    if (!currentCar || locked) return;

    setLocked(true);
    const car = currentCar;
    const carId = car.id;

    // No more toast near image: show near bottom (styles.toast)
    showToast(direction === "right" ? "Saved to Liked ✅" : "Skipped ❌");

    animateSwipeOut(direction, async () => {
      try {
        if (direction === "right") {
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
    });
  }

  const panResponder = useMemo(() => {
    return PanResponder.create({
     onStartShouldSetPanResponder: () => false, // never grab on touch start
     onMoveShouldSetPanResponder: (_, g) => {
       if (locked) return false;
       if (carouselActiveRef.current) return false;

       // only treat as card swipe if it's a *strong* horizontal intent
       const dx = Math.abs(g.dx);
       const dy = Math.abs(g.dy);

       return dx > 18 && dx > dy * 1.4;
     },
      onPanResponderMove: (_, g) => {
        position.setValue({ x: g.dx, y: 0 });
      },
      onPanResponderRelease: (_, g) => {
        if (locked || carouselActiveRef.current) return;

        if (g.dx > SWIPE_THRESHOLD) {
          void commitSwipe("right");
          return;
        }
        if (g.dx < -SWIPE_THRESHOLD) {
          void commitSwipe("left");
          return;
        }

        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 6,
        }).start();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, index, currentCar]);

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
            {/* Deck */}
            <View style={styles.deck}>
              {nextCar ? (
                <View style={[styles.card, styles.cardBehind]}>
                  <CarCardContent
                    car={nextCar}
                    onCarouselActiveChange={(active) => {
                      // behind card doesn't really matter but keep consistent
                      carouselActiveRef.current = active;
                    }}
                  />
                </View>
              ) : null}

              <Animated.View
                {...panResponder.panHandlers}
                style={[styles.card, styles.cardFront, cardStyle]}
              >
                <CarCardContent
                  car={currentCar}
                  onCarouselActiveChange={(active) => {
                    carouselActiveRef.current = active;
                  }}
                />
              </Animated.View>
            </View>

            {/* Toast near buttons (NOT above image) */}
            <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toastOpacity }]}>
              <View style={styles.toastTextWrap}>
                <Text style={styles.toastText}>{toastTextRef.current}</Text>
              </View>
            </Animated.View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <ActionButton variant="dislike" disabled={locked} onPress={() => void commitSwipe("left")} />
              <ActionButton variant="like" disabled={locked} onPress={() => void commitSwipe("right")} />
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

function CarCardContent({
  car,
  onCarouselActiveChange,
}: {
  car: CarCard;
  onCarouselActiveChange: (active: boolean) => void;
}) {
  // 3 images per car for now (mock). Later: backend returns array.
  const images = useMemo(() => {
    const base = car.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(car.id)}/900/600`;
    return [
      base,
      `https://picsum.photos/seed/${encodeURIComponent(car.id + "_2")}/900/600`,
      `https://picsum.photos/seed/${encodeURIComponent(car.id + "_3")}/900/600`,
    ];
  }, [car.id, car.imageUrl]);

  const [imgIndex, setImgIndex] = useState(0);

  return (
    <View style={styles.cardInner}>
      <View style={styles.carouselWrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => onCarouselActiveChange(true)}
          onScrollEndDrag={() => {
            // allow card swipe again shortly after release
            setTimeout(() => onCarouselActiveChange(false), 120);
          }}
          onMomentumScrollEnd={() => onCarouselActiveChange(false)}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const w = e.nativeEvent.layoutMeasurement.width || 1;
            setImgIndex(Math.round(x / w));
          }}
          scrollEventThrottle={16}
        >
          {images.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.cardImage} />
          ))}
        </ScrollView>

        <View style={styles.dotsRow}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
          ))}
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{car.title}</Text>
        {car.subtitle ? <Text style={styles.cardSubtitle}>{car.subtitle}</Text> : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>🎨 {car.color}</Text>
          <Text style={styles.metaText}>⭐ {car.rating?.toFixed(1) ?? "—"}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            {car.pricePerDay} {car.currency} / day
          </Text>
        </View>
      </View>
    </View>
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

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial]);

  function set<K extends keyof CarSearchFilters>(key: K, value: CarSearchFilters[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
  }

  // model options depend on brand
  const modelOptions = draft.brand ? modelsByBrand[draft.brand] ?? [] : [];
  const fuelOptions: (FuelType | "")[] = ["", "gas", "diesel", "electric", "hybrid"];

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
            {/* Fuel */}
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

            {/* Brand */}
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

            {/* Model */}
            <Text style={styles.fieldLabel}>Model</Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[styles.option, !draft.model && styles.optionActive]}
                onPress={() => set("model", undefined)}
              >
                <Text style={[styles.optionText, !draft.model && styles.optionTextActive]}>any</Text>
              </Pressable>

              {modelOptions.length === 0 ? (
                <Text style={styles.helperText}>Pick a brand to see models.</Text>
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

            {/* Color */}
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.optionRow}>
              <Pressable
                style={[styles.option, !draft.color && styles.optionActive]}
                onPress={() => set("color", undefined)}
              >
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

            {/* Price */}
            <Text style={styles.fieldLabel}>Price per day</Text>
            <View style={styles.priceInputsRow}>
              <TextInput
                value={draft.priceRange.min.toFixed(2)}
                onChangeText={(v) => {
                  const n = Number(String(v).replace(",", "."));
                  set("priceRange", { ...draft.priceRange, min: Number.isFinite(n) ? n : 0 });
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={[styles.input, styles.priceInput]}
              />
              <TextInput
                value={draft.priceRange.max.toFixed(2)}
                onChangeText={(v) => {
                  const n = Number(String(v).replace(",", "."));
                  set("priceRange", { ...draft.priceRange, max: Number.isFinite(n) ? n : 500 });
                }}
                placeholder="500.00"
                keyboardType="decimal-pad"
                style={[styles.input, styles.priceInput]}
              />
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, styles.modalBtnGhost]} onPress={() => setDraft(DEFAULT_FILTERS)}>
                <Text style={[styles.modalBtnText, styles.modalBtnTextGhost]}>Reset</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={() => {
                  const min = Math.min(draft.priceRange.min, draft.priceRange.max);
                  const max = Math.max(draft.priceRange.min, draft.priceRange.max);
                  onApply({ ...draft, priceRange: { min, max } });
                }}
              >
                <Text style={styles.modalBtnText}>Apply</Text>
              </Pressable>
            </View>

            {/* Extra spacer so keyboard never hides bottom buttons */}
            <View style={{ height: 180 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },

  likedPill: {
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  likedPillText: { color: "#111827", fontSize: 12, fontWeight: "800" },

  filtersButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filtersButtonText: { color: "#fff", fontWeight: "600" },

  chipsRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    paddingBottom: 10,
  },
  chip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { color: "#111827", fontSize: 12, fontWeight: "600" },

  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 12 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  mutedText: { color: "#6B7280", fontWeight: "600" },
  mutedTextSmall: { color: "#9CA3AF" },
  errorText: { color: "#B91C1C", fontWeight: "700" },
  retryBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },

  deck: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  cardBehind: { position: "absolute", top: 12, transform: [{ scale: 0.98 }], opacity: 0.9 },
  cardFront: { position: "absolute", top: 0 },

  cardInner: { backgroundColor: "#fff" },
  cardImage: { width: SCREEN_WIDTH - 32, height: 220, backgroundColor: "#E5E7EB" },

  carouselWrap: { position: "relative" },
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
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  dotActive: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  cardBody: { padding: 14 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  cardSubtitle: { marginTop: 4, color: "#6B7280", fontWeight: "600" },

  metaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  metaText: { color: "#111827", fontWeight: "700" },

  priceRow: { marginTop: 12 },
  priceText: { fontSize: 18, fontWeight: "900", color: "#111827" },

  toast: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 110, // above action buttons + tab bar
    alignItems: "center",
    zIndex: 50,
  },
  toastTextWrap: {
    backgroundColor: "#111827",
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
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { fontWeight: "900", fontSize: 16 },
  dislikeBtn: { backgroundColor: "#FEE2E2" },
  likeBtn: { backgroundColor: "#FEF9C3" },

  prefetchText: {
    textAlign: "center",
    marginTop: 10,
    color: "#6B7280",
    fontWeight: "700",
  },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "82%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  modalClose: { fontWeight: "800", color: "#111827" },

  fieldLabel: { marginTop: 14, marginBottom: 6, color: "#374151", fontWeight: "800" },
  helperText: { marginTop: 8, color: "#6B7280", fontWeight: "600" },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  option: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  optionActive: { backgroundColor: "#111827", borderColor: "#111827" },
  optionText: { color: "#111827", fontWeight: "800" },
  optionTextActive: { color: "#fff" },

  priceInputsRow: { flexDirection: "row", gap: 10 },
  priceInput: { flex: 1 },

  modalActions: { marginTop: 18, flexDirection: "row", gap: 10 },
  modalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  modalBtnPrimary: { backgroundColor: "#111827" },
  modalBtnGhost: { backgroundColor: "#F3F4F6" },
  modalBtnText: { fontWeight: "900", color: "#fff" },
  modalBtnTextGhost: { color: "#111827" },
});
