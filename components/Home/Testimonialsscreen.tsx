import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.82;
const CARD_MARGIN = (SCREEN_WIDTH - CARD_WIDTH) / 2;

// ─── Testimonial Data ────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    id: "1",
    name: "Sarah M.",
    role: "HR Director",
    company: "TechCorp",
    initials: "S",
    avatarColor: "#3B82F6",
    rating: 5,
    quote:
      '"Talent Access completely transformed our hiring process. We cut time-to-hire by 60% while dramatically improving candidate quality."',
  },
  {
    id: "2",
    name: "James R.",
    role: "Talent Lead",
    company: "BuildFirm",
    initials: "J",
    avatarColor: "#6366F1",
    rating: 5,
    quote:
      '"The assessment library is incredible. We found exactly what we needed for our specialized engineering roles without any customization."',
  },
  {
    id: "3",
    name: "Priya K.",
    role: "Recruiter",
    company: "FinanceHub",
    initials: "P",
    avatarColor: "#10B981",
    rating: 5,
    quote:
      '"The anti-cheat features give us full confidence that our scores are genuine. Game-changer for remote hiring."',
  },
  {
    id: "4",
    name: "Marcus T.",
    role: "People Ops Manager",
    company: "ScaleUp",
    initials: "M",
    avatarColor: "#F59E0B",
    rating: 5,
    quote:
      '"Onboarding took less than a day and our entire team was up and running immediately. The ROI was visible within two weeks."',
  },
];

// ─── Star Rating ─────────────────────────────────────────────────────────────

const StarRating = ({ count, isActive }) => (
  <View style={styles.starsRow}>
    {Array.from({ length: count }).map((_, i) => (
      <Text key={i} style={[styles.star, isActive && styles.starActive]}>
        ★
      </Text>
    ))}
  </View>
);

// ─── Quote Icon ───────────────────────────────────────────────────────────────

const QuoteIcon = ({ isActive }) => (
  <Text style={[styles.quoteIcon, isActive && styles.quoteIconActive]}>"</Text>
);

// ─── Testimonial Card ─────────────────────────────────────────────────────────

const TestimonialCard = ({ item, isActive }) => {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.93)).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isActive ? 1 : 0.93,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: isActive ? 1 : 0.6,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.card,
        isActive && styles.cardActive,
        { transform: [{ scale }], opacity },
      ]}
    >
      {/* Top: stars + quote mark */}
      <View style={styles.cardTop}>
        <StarRating count={item.rating} isActive={isActive} />
        <QuoteIcon isActive={isActive} />
      </View>

      {/* Review text */}
      <Text style={[styles.quoteText, isActive && styles.quoteTextActive]}>
        {item.quote}
      </Text>

      {/* Divider */}
      <View
        style={[styles.cardDivider, isActive && styles.cardDividerActive]}
      />

      {/* Author row */}
      <View style={styles.authorRow}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarInitials}>{item.initials}</Text>
        </View>
        {/* Name + role */}
        <View style={styles.authorInfo}>
          <Text
            style={[styles.authorName, isActive && styles.authorNameActive]}
          >
            {item.name}
          </Text>
          <Text style={styles.authorRole}>
            {item.role} · {item.company}
          </Text>
        </View>
        {/* Active badge */}
        {isActive && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Pagination Dots ──────────────────────────────────────────────────────────

const PaginationDots = ({ count, activeIndex }) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: count }).map((_, i) => {
      const isActive = i === activeIndex;
      return (
        <Animated.View
          key={i}
          style={[styles.dot, isActive && styles.dotActive]}
        />
      );
    })}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TestimonialsScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % TESTIMONIALS.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (index !== activeIndex) setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F5FF" />

      <View style={styles.container}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowLine} />
            <Text style={styles.eyebrowText}>TESTIMONIALS</Text>
            <View style={styles.eyebrowLine} />
          </View>
          <Text style={styles.heading}>What Our{"\n"}Customers Say</Text>
          <Text style={styles.subheading}>
            Trusted by 1,200+ hiring teams worldwide
          </Text>
        </View>

        {/* ── Carousel ── */}
        <FlatList
          ref={flatListRef}
          data={TESTIMONIALS}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled={false}
          snapToInterval={CARD_WIDTH + 16}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + 16,
            offset: (CARD_WIDTH + 16) * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <TestimonialCard item={item} isActive={index === activeIndex} />
          )}
        />

        {/* ── Dots ── */}
        <PaginationDots count={TESTIMONIALS.length} activeIndex={activeIndex} />

        {/* ── Nav arrows ── */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, activeIndex === 0 && styles.navBtnDisabled]}
            onPress={() => {
              const prev = Math.max(activeIndex - 1, 0);
              flatListRef.current?.scrollToIndex({
                index: prev,
                animated: true,
              });
              setActiveIndex(prev);
            }}
          >
            <Text style={styles.navArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.navCounter}>
            {activeIndex + 1} / {TESTIMONIALS.length}
          </Text>

          <TouchableOpacity
            style={[
              styles.navBtn,
              styles.navBtnPrimary,
              activeIndex === TESTIMONIALS.length - 1 && styles.navBtnDisabled,
            ]}
            onPress={() => {
              const next = Math.min(activeIndex + 1, TESTIMONIALS.length - 1);
              flatListRef.current?.scrollToIndex({
                index: next,
                animated: true,
              });
              setActiveIndex(next);
            }}
          >
            <Text style={[styles.navArrow, styles.navArrowPrimary]}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F0F5FF",
  },
  container: {
    flex: 1,
    paddingTop: 36,
    paddingBottom: 24,
  },

  // ── Header ──
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  eyebrowLine: {
    width: 28,
    height: 1.5,
    backgroundColor: "#2D54E8",
    borderRadius: 2,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "#2D54E8",
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0D1B3E",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13.5,
    color: "#6B7A99",
    textAlign: "center",
  },

  // ── List ──
  listContent: {
    paddingHorizontal: CARD_MARGIN - 8,
    gap: 16,
    alignItems: "center",
  },

  // ── Card ──
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: "#E6EAF4",
    shadowColor: "#8FA6CF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardActive: {
    borderColor: "#2D54E8",
    shadowColor: "#2D54E8",
    shadowOpacity: 0.18,
    elevation: 8,
  },

  // ── Card Top ──
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    gap: 3,
  },
  star: {
    fontSize: 17,
    color: "#CBD5E1",
  },
  starActive: {
    color: "#F59E0B",
  },
  quoteIcon: {
    fontSize: 48,
    lineHeight: 42,
    fontWeight: "900",
    color: "#E2E8F0",
  },
  quoteIconActive: {
    color: "#BFCFFF",
  },

  // ── Quote ──
  quoteText: {
    fontSize: 14.5,
    lineHeight: 23,
    color: "#6B7A99",
    fontStyle: "italic",
    marginBottom: 20,
  },
  quoteTextActive: {
    color: "#2D3A5A",
  },

  // ── Divider ──
  cardDivider: {
    height: 1,
    backgroundColor: "#EEF2FF",
    marginBottom: 18,
  },
  cardDividerActive: {
    backgroundColor: "#C7D4FF",
  },

  // ── Author ──
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A5568",
  },
  authorNameActive: {
    color: "#0D1B3E",
  },
  authorRole: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 1,
  },
  verifiedBadge: {
    backgroundColor: "#EBF5EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#22C55E",
  },

  // ── Dots ──
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    marginTop: 24,
    marginBottom: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C7D4FF",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#2D54E8",
  },

  // ── Nav ──
  navRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 24,
  },
  navBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: "#C7D4FF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8FA6CF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  navBtnPrimary: {
    backgroundColor: "#2D54E8",
    borderColor: "#2D54E8",
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navArrow: {
    fontSize: 18,
    color: "#2D54E8",
    fontWeight: "700",
  },
  navArrowPrimary: {
    color: "#FFFFFF",
  },
  navCounter: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    minWidth: 40,
    textAlign: "center",
  },
});
