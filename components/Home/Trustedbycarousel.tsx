import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

// import img1 from "../../assets/images/client/ACC.png";
// import img2 from "../../assets/images/client/ADP.png";
// import img3 from "../../assets/images/client/AMAZON.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Company data with placeholder logo URIs ──────────────────────────────────
const COMPANIES = [
  {
    id: "1",
    name: "ACC",
    logo: require("../../assets/images/client/ACC.png"),
    color: "#4285F4",
  },
  {
    id: "2",
    name: "ADSF",
    logo: require("../../assets/images/client/ADSF.png"),
    color: "#F25022",
  },
  {
    id: "3",
    name: "APSE",
    logo: require("../../assets/images/client/APSE.png"),
    color: "#4A154B",
  },
  {
    id: "4",
    name: "Aspire Edtech",
    logo: require("../../assets/images/client/AspireEdtech.png"),
    color: "#635BFF",
  },
  {
    id: "5",
    name: "Ayana",
    logo: require("../../assets/images/client/Ayana.jpg"),
    color: "#22C55E",
  },
  {
    id: "6",
    name: "Barclays", // ✔ spelling fixed
    logo: require("../../assets/images/client/barclayes.png"),
    color: "#0EA5E9",
  },
  {
    id: "7",
    name: "CED",
    logo: require("../../assets/images/client/Ced.png"),
    color: "#F59E0B",
  },
  {
    id: "8",
    name: "Coromandel", // ✔ spelling fixed
    logo: require("../../assets/images/client/Coromander.png"),
    color: "#EF4444",
  },
  {
    id: "9",
    name: "HMB",
    logo: require("../../assets/images/client/HMB.png"),
    color: "#8B5CF6",
  },
  {
    id: "10",
    name: "LBSS",
    logo: require("../../assets/images/client/LBSS.png"),
    color: "#14B8A6",
  },
  {
    id: "11",
    name: "GSJBSA", // ✔ cleaned name
    logo: require("../../assets/images/client/Logo.png"),
    color: "#64748B",
  },
  {
    id: "12",
    name: "Manab",
    logo: require("../../assets/images/client/Manab.png"),
    color: "#EC4899",
  },
  {
    id: "13",
    name: "NRL",
    logo: require("../../assets/images/client/nrl.png"),
    color: "#84CC16",
  },
  {
    id: "14",
    name: "NSDC",
    logo: require("../../assets/images/client/Nsdc.png"),
    color: "#06B6D4",
  },
  {
    id: "15",
    name: "Om",
    logo: require("../../assets/images/client/Om.png"),
    color: "#F97316",
  },
  {
    id: "16",
    name: "Red",
    logo: require("../../assets/images/client/Red.png"),
    color: "#DC2626",
  },
  {
    id: "17",
    name: "Roshani",
    logo: require("../../assets/images/client/Roshani.png"),
    color: "#9333EA",
  },
  {
    id: "18",
    name: "SEED",
    logo: require("../../assets/images/client/SEED.png"),
    color: "#16A34A",
  },
  {
    id: "19",
    name: "SSC",
    logo: require("../../assets/images/client/Sscac.png"),
    color: "#0284C7",
  },
  {
    id: "20",
    name: "Udichi",
    logo: require("../../assets/images/client/udichi.png"),
    color: "#7C3AED",
  },
];

// ── Config ────────────────────────────────────────────────────────────────────
const ITEM_WIDTH = 120; // logo card width
const ITEM_MARGIN = 20; // horizontal margin per side
const ITEM_TOTAL = ITEM_WIDTH + ITEM_MARGIN * 2;
const SPEED = 0.4; // pixels per frame (~60fps → ~24px/s)
const DUPLICATES = 2; // how many times we tile the list to fill space

// ── Logo Card ─────────────────────────────────────────────────────────────────
const LogoCard = ({ item }) => (
  <View style={styles.card}>
    <View style={[styles.logoBox, { borderColor: `${item.color}22` }]}>
      <Image
        source={typeof item.logo === "string" ? { uri: item.logo } : item.logo}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.companyName}>{item.name}</Text>
  </View>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function TrustedByCarousel() {
  // Tile the array enough times so the seam is never visible
  const items = Array.from({ length: DUPLICATES }, () => COMPANIES).flat();
  const totalWidth = ITEM_TOTAL * items.length;
  const segmentWidth = ITEM_TOTAL * COMPANIES.length; // one full loop width

  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);
  const posRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    let lastTime = null;

    const tick = (timestamp) => {
      if (lastTime !== null) {
        const delta = timestamp - lastTime;
        posRef.current += SPEED * delta * 0.06; // ~pixels per ms

        // Reset when one full segment has scrolled past → seamless loop
        if (posRef.current >= segmentWidth) {
          posRef.current -= segmentWidth;
        }

        translateX.setValue(-posRef.current);
      }
      lastTime = timestamp;
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dividerLine} />
        <Text style={styles.headerText}>TRUSTED BY LEADING COMPANIES</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Carousel */}
      <View style={styles.carouselWrapper}>
        {/* Left fade */}
        {/* <View style={[styles.fade, styles.fadeLeft]} pointerEvents="none" /> */}

        <View style={styles.carouselClip}>
          <Animated.View
            style={[
              styles.track,
              { width: totalWidth, transform: [{ translateX }] },
            ]}
          >
            {items.map((item, index) => (
              <LogoCard key={`${item.id}-${index}`} item={item} />
            ))}
          </Animated.View>
        </View>

        {/* Right fade */}
        {/* <View style={[styles.fade, styles.fadeRight]} pointerEvents="none" /> */}
      </View>

      {/* Footer stat */}
      <Text style={styles.footerStat}>
        Join <Text style={styles.highlight}>500+</Text> companies already hiring
        smarter
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 36,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 28,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  headerText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.8,
    textAlign: "center",
  },

  // Carousel
  carouselWrapper: {
    position: "relative",
  },
  carouselClip: {
    overflow: "hidden",
    width: SCREEN_WIDTH,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Fade edges
  fade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 56,
    zIndex: 10,
  },
  fadeLeft: {
    left: 0,
    background: "linear-gradient(to right, #ffffff, transparent)", // web fallback
    // React Native gradient requires expo-linear-gradient; simulate with opacity
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
  },
  fadeRight: {
    right: 0,
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
  },

  // Card
  card: {
    width: ITEM_WIDTH,
    marginHorizontal: ITEM_MARGIN,
    alignItems: "center",
  },
  logoBox: {
    width: ITEM_WIDTH,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  companyName: {
    marginTop: 8,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.2,
  },

  // Footer
  footerStat: {
    textAlign: "center",
    marginTop: 28,
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  highlight: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
