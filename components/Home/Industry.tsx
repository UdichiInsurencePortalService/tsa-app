import React, { useState } from "react";
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// ─── Data ────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { id: 1, label: "Manufacturing", emoji: "🏭" },
  { id: 2, label: "Government", emoji: "🏛️" },
  { id: 3, label: "Healthcare", emoji: "🏥" },
  { id: 4, label: "Engineering", emoji: "⚙️" },
  { id: 5, label: "Construction", emoji: "🏗️" },
  { id: 6, label: "Energy/Utilities", emoji: "⚡" },
  { id: 7, label: "Financial Services", emoji: "💰" },
  { id: 8, label: "Transportation", emoji: "🚚" },
  { id: 9, label: "Education", emoji: "🎓" },
  { id: 10, label: "Staffing", emoji: "👥" },
  { id: 11, label: "Call Center", emoji: "📞" },
  { id: 12, label: "Hospitality", emoji: "🏨" },
];

// ─── Color Tokens ─────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#F0F4FA",
  surface: "#FFFFFF",
  surfaceHover: "#E8EEF8",
  selectedBg: "#EBF0FF",
  selectedBorder: "#2D54E8",
  accent: "#2D54E8",
  accentLight: "#EBF0FF",
  label: "#0D1B3E",
  labelSecondary: "#4A5568",
  pill: "#FFFFFF",
  pillText: "#2D54E8",
  pillBorder: "#2D54E8",
  shadow: "#A0AEC0",
  tag: "#3B82F6",
  tagText: "#FFFFFF",
  divider: "#E2E8F0",
};

// ─── IndustryCard Component ───────────────────────────────────────────────────

const IndustryCard = ({ item, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.card, isSelected && styles.cardSelected]}
    onPress={() => onPress(item.id)}
    activeOpacity={0.75}
  >
    {/* Icon area */}
    <View
      style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
    </View>

    {/* Label */}
    <Text
      style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}
      numberOfLines={2}
    >
      {item.label}
    </Text>

    {/* Read More link */}
    <TouchableOpacity>
      <Text style={[styles.readMore, isSelected && styles.readMoreSelected]}>
        Read More
      </Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── App ──────────────────────────────────────────────────────────────────────

export default function Industry() {
  const [selectedId, setSelectedId] = useState(8); // Transportation pre-selected

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // Split into rows of 2 for mobile grid
  const rows = [];
  for (let i = 0; i < INDUSTRIES.length; i += 2) {
    rows.push(INDUSTRIES.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Eyebrow */}
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDash} />
            <Text style={styles.eyebrowText}>INDUSTRIES</Text>
          </View>

          {/* Title + CTA row */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Built for Every{"\n"}Industry</Text>
            <TouchableOpacity style={styles.pill}>
              <Text style={styles.pillText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Pre-hire assessments tailored for virtually any sector.
          </Text>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Grid ── */}
        <View style={styles.grid}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <IndustryCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onPress={handleSelect}
                />
              ))}
              {/* Fill empty slot in last row if odd count */}
              {row.length === 1 && <View style={styles.cardPlaceholder} />}
            </View>
          ))}
        </View>

        {/* ── Bottom CTA ── */}
        <TouchableOpacity style={styles.bottomCta} activeOpacity={0.85}>
          <Text style={styles.bottomCtaText}>View All Industries →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header ──
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 28,
    paddingBottom: 12,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  eyebrowDash: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.accent,
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.label,
    lineHeight: 34,
    flex: 1,
  },
  pill: {
    borderWidth: 1.5,
    borderColor: COLORS.pillBorder,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 4,
    backgroundColor: COLORS.pill,
    // Shadow
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.pillText,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: COLORS.labelSecondary,
    lineHeight: 20,
    marginTop: 2,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
  },

  // ── Grid ──
  grid: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: CARD_GAP,
  },
  row: {
    flexDirection: "row",
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // ── Card ──
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    // Shadow
    shadowColor: "#8BA0C0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    backgroundColor: COLORS.selectedBg,
    borderColor: COLORS.selectedBorder,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  cardPlaceholder: {
    width: CARD_WIDTH,
  },

  // ── Card Icon ──
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconWrapperSelected: {
    backgroundColor: "#D6E0FF",
  },
  emoji: {
    fontSize: 26,
  },

  // ── Card Text ──
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.label,
    marginBottom: 6,
    lineHeight: 19,
  },
  cardLabelSelected: {
    color: COLORS.accent,
  },
  readMore: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
    textDecorationLine: "underline",
    textDecorationColor: COLORS.accent,
  },
  readMoreSelected: {
    color: "#1A3CBF",
  },

  // ── Bottom CTA ──
  bottomCta: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginTop: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  bottomCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
