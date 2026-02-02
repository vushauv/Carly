//mobile/app/components/CarCardView.tsx
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native";

type Props = {
  title: string;
  subtitle?: string | null;

  /** 0..N remote image URLs */
  images?: string[];

  /** Used when images is empty */
  fallbackSource?: ImageSourcePropType;

  /** Emoji-friendly */
  metaLeft?: string;
  metaRight?: string;

  /** Footer left text (often price) */
  footerLeft?: string;

  /** Right side of footer (buttons etc.) */
  footerRight?: React.ReactNode;

  /** Optional outer style override */
  style?: ViewStyle;

  /** Default 200 */
  imageHeight?: number;
};

export default function CarCardView({
  title,
  subtitle,
  images = [],
  fallbackSource,
  metaLeft,
  metaRight,
  footerLeft,
  footerRight,
  style,
  imageHeight = 200,
}: Props) {
  const [previewWidth, setPreviewWidth] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  const slides = useMemo(() => {
    if (images.length > 0) return images;
    return [];
  }, [images]);

  const slidesCount = slides.length > 0 ? slides.length : 1;

return (
  <View style={[styles.card, style]}>
    <View
      style={styles.previewWrap}
      onLayout={(e) => setPreviewWidth(e.nativeEvent.layout.width)}
    >
      {slides.length > 0 ? (
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
          {slides.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              style={{ width: previewWidth || 1, height: imageHeight }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : (
        <Image
          source={fallbackSource ?? { uri: "https://picsum.photos/900/600" }}
          style={{ width: previewWidth || 1, height: imageHeight }}
          resizeMode={fallbackSource ? "contain" : "cover"}
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

    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {(metaLeft || metaRight) ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{metaLeft ?? ""}</Text>
          <Text style={styles.metaText}>{metaRight ?? ""}</Text>
        </View>
      ) : null}

      {(footerLeft || footerRight) ? (
        <View style={styles.footerRow}>
          <Text style={styles.footerLeft}>{footerLeft ?? ""}</Text>
          <View style={styles.footerRight}>{footerRight}</View>
        </View>
      ) : null}
    </View>
  </View>
);

}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  previewWrap: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    position: "relative",
    borderWidth: 1,
    borderColor: "#FDE68A",
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

  body: {
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    fontWeight: "800",
  },

  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    color: "#111827",
    fontWeight: "900",
  },

  footerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerLeft: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});


